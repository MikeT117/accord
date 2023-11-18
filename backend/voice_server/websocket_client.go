package voice_server

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/MikeT117/accord/backend/internal/authentication"
	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v4"
)

type WebsocketClient struct {
	id                    uuid.UUID
	hub                   *WebsocketHub
	peer                  *Peer
	conn                  *websocket.Conn
	authenticated         bool
	accesstoken           string
	refreshtoken          string
	accesstokenExpiresAt  time.Time
	refreshtokenExpiresAt time.Time
}

type IncomingWebsocketMessage struct {
	Op string `json:"op"`
	D  struct {
		Accesstoken  string                    `json:"accesstoken"`
		Refreshtoken string                    `json:"refreshtoken"`
		Answer       webrtc.SessionDescription `json:"answer"`
		Candidate    webrtc.ICECandidateInit   `json:"candidate"`
		ChannelID    uuid.UUID                 `json:"channelId"`
	}
}

type OutgoingWebsocketMessage struct {
	Op string `json:"op"`
	D  string `json:"d"`
}

func (wc *WebsocketClient) CloseMessage(status int, message string) {
	wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(status, message))
}

func (wc *WebsocketClient) CheckTokens() error {
	fmt.Println("TOKENS_CHECK")
	if wc.accesstokenExpiresAt.Before(time.Now().Add(time.Minute * 5)) {
		if wc.refreshtokenExpiresAt.Before(time.Now()) {
			wc.conn.WriteMessage(websocket.CloseMessage, []byte("EXPIRED_TOKENS"))
			return errors.New("EXPIRED_TOKENS")
		}

		session, err := wc.hub.queries.GetUserSessionByToken(context.Background(), wc.refreshtoken)

		if err != nil {
			wc.conn.WriteMessage(websocket.CloseMessage, []byte("INVALID_TOKENS"))
			return errors.New("INVALID_TOKENS")
		}

		accesstokenJwt, accesstoken, err := authentication.CreateAndSignToken(session.UserID.String(), []byte(os.Getenv("JWT_ACCESSTOKEN_KEY")), uuid.NewString(), time.Now().Add(time.Hour))

		if err != nil {
			log.Printf("accord_authentication.CreateAndSignToken err: %v\n", err)
			wc.conn.WriteMessage(websocket.CloseInternalServerErr, []byte("INTERNAL_SERVER_ERROR"))
			return errors.New("INTERNAL_SERVER_ERROR")
		}

		wc.accesstoken = string(accesstoken)
		wc.accesstokenExpiresAt = accesstokenJwt.Expiration()
	}

	return nil
}

func (wc *WebsocketClient) Identify(accesstoken string, refreshtoken string) {

	accesstokenJwt, accesstokenID, err := authentication.ValidateToken(accesstoken, []byte(os.Getenv("JWT_ACCESSTOKEN_KEY")))

	if err != nil {
		wc.CloseMessage(1003, "INVALID_TOKENS")
		return
	}

	refreshtokenJwt, refreshtokenID, err := authentication.ValidateToken(refreshtoken, []byte(os.Getenv("JWT_REFRESHTOKEN_KEY")))

	if err != nil {
		wc.CloseMessage(1003, "INVALID_TOKENS")
		return
	}

	if accesstokenID != refreshtokenID {
		wc.CloseMessage(1003, "INVALID_TOKENS")
		return
	}

	session, err := wc.hub.queries.GetUserSessionByToken(context.Background(), refreshtoken)

	if err != nil {
		if database.IsPGErrNoRows(err) {
			wc.CloseMessage(1003, "INVALID_SESSION")
		} else {
			wc.CloseMessage(1002, "INTERNAL_SERVER_ERROR")
		}
		return
	}

	if _, ok := wc.hub.clients[refreshtokenID]; ok {
		wc.CloseMessage(1003, "DUPLICATE_CONNECTION")
		return
	}

	wc.id = session.UserID
	wc.authenticated = true
	wc.accesstoken = accesstoken
	wc.refreshtoken = refreshtoken
	wc.accesstokenExpiresAt = accesstokenJwt.Expiration()
	wc.refreshtokenExpiresAt = refreshtokenJwt.Expiration()

	wc.hub.RegisterClient(wc)
}

func (wc *WebsocketClient) Authorise(channelID uuid.UUID, permission int) {
	permissions, err := wc.hub.queries.GetGuildRolePermissionsByUserIDAndChannelID(context.Background(), sqlc.GetGuildRolePermissionsByUserIDAndChannelIDParams{
		UserID:    wc.id,
		ChannelID: channelID,
	})

	if err != nil {
		wc.CloseMessage(4001, "internal error occurred")
		return
	}

	if permissions == -1 {
		wc.CloseMessage(4001, "channel not found")
		return
	}

	if permissions&(1<<permission) == 0 {
		wc.CloseMessage(4001, "you are not authorised to access this resource")
		return
	}
}

func (wc *WebsocketClient) ReadMessages() {

	wc.conn.SetReadDeadline(time.Now().Add(wc.hub.pongWait))

	message := &IncomingWebsocketMessage{}
	for {
		_, p, err := wc.conn.ReadMessage()
		fmt.Println("READ_MESSAGE_EXECUTING")

		if err != nil {
			log.Println(err)
			return
		} else if err := json.Unmarshal(p, &message); err != nil {
			log.Println(err)
			return
		}

		fmt.Println("READ MESSAGE - OP: ", message.Op)
		switch message.Op {
		case "IDENTIFY":
			/*
				TODO: Consider validating the payload!
				TODO: Deal with role permissions or role assignments changing

				When a connection is made:
					1: Verify the user's tokens
					2: Verify the user has the rights to connect to the channel
			*/

			wc.Identify(message.D.Accesstoken, message.D.Refreshtoken)
			wc.Authorise(message.D.ChannelID, constants.VIEW_GUILD_CHANNEL)

			channel := wc.hub.webRTCHub.CreateChannel(message.D.ChannelID)
			peer, err := channel.CreatePeer(wc.id.String(), wc.conn)

			if err != nil {
				log.Println(err)
				wc.CloseMessage(4001, "peer could not be created")
				return
			}

			wc.peer = peer
			channel.SignalPeers()

			sqlVoiceChannelState, err := wc.hub.queries.CreateVoiceChannelState(context.Background(), sqlc.CreateVoiceChannelStateParams{
				UserID:    wc.id,
				ChannelID: channel.ID,
			})

			if err != nil {
				log.Println(err)
				peer.pConn.Close()
				wc.CloseMessage(4001, "peer could not be created")
				return
			}

			roleIDs, err := wc.hub.queries.GetRoleIDsByChannelID(context.Background(), channel.ID)

			if err != nil {
				log.Println(err)
				peer.pConn.Close()
				wc.CloseMessage(4001, "peer could not be created")
				return
			}

			wc.hub.messageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
				Version: 0,
				Op:      "VOICE_CHANNEL_STATE_CREATE",
				RoleIDs: roleIDs,
				UserIDs: []string{},
				Data:    sqlVoiceChannelState,
			})

		case "CANDIDATE":
			if err := wc.peer.pConn.AddICECandidate(message.D.Candidate); err != nil {
				log.Println(err)
				wc.CloseMessage(4001, "peer could not be created")
				return
			}
		case "ANSWER":
			if err := wc.peer.pConn.SetRemoteDescription(message.D.Answer); err != nil {
				log.Println(err)
				wc.CloseMessage(4001, "peer could not be created")
				return
			}
		}

	}
}

func (wc *WebsocketClient) WriteMessages() {

	ticker := time.NewTicker(wc.hub.pingInterval)

	defer func() {
		ticker.Stop()
	}()

	for {
		<-ticker.C
		fmt.Println("SENDING_PING")
		wc.conn.SetWriteDeadline(time.Now().Add(wc.hub.writeWait))
		if err := wc.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
			wc.CloseMessage(1002, "PING_FAILURE")
			return
		}

	}
}
