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
	"github.com/MikeT117/accord/backend/internal/goverter"
	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v4"
)

type WebsocketClient struct {
	id                    uuid.UUID
	authenticated         bool
	accesstoken           string
	refreshtoken          string
	accesstokenExpiresAt  time.Time
	refreshtokenExpiresAt time.Time
	hub                   *VoiceServerHub
	wConn                 *websocket.Conn
	local                 chan *message_queue.LocalPayload
	authDeadline          *time.Timer
	channel               *WebRTCChannel
	pConn                 *webrtc.PeerConnection
}

func (hub *VoiceServerHub) CreateClient(conn *websocket.Conn) {

	wc := &WebsocketClient{
		hub:           hub,
		authenticated: false,
		wConn:         conn,
		local:         make(chan *message_queue.LocalPayload),
	}

	conn.SetPongHandler(func(string) error {
		if err := conn.SetReadDeadline(time.Now().Add(hub.pongWait)); err != nil {
			wc.CloseMessage(websocket.ClosePolicyViolation, "PONG_TIMEOUT")
			return err
		}
		return nil
	})

	conn.SetCloseHandler(func(code int, text string) error {
		fmt.Println("CLOSE_HANDLER - Reason: ", text)
		close(wc.local)
		hub.DelClient(wc.id)
		return nil
	})

	wc.authDeadline = time.AfterFunc(hub.authTimeout, func() {
		if !wc.authenticated {
			log.Println("AUTHENTICATION_DEADLINE_REACHED")
			wc.CloseMessage(websocket.ClosePolicyViolation, "AUTHENTICATION_TIMEOUT")
		}
	})

	go wc.ReadMessages()
	go wc.HandlePing()
	go wc.HandleLocalPayload()
}

func (wc *WebsocketClient) CloseClient() {
	close(wc.local)
	wc.wConn.Close()
}

func (wc *WebsocketClient) CloseMessage(status int, message string) {
	wc.wConn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(status, message))
}

func (wc *WebsocketClient) CheckTokens() error {
	if wc.accesstokenExpiresAt.Before(time.Now().Add(time.Minute * 5)) {
		if wc.refreshtokenExpiresAt.Before(time.Now()) {
			return errors.New("EXPIRED_TOKENS")
		}

		session, err := wc.hub.queries.GetUserSessionByToken(context.Background(), wc.refreshtoken)

		if err != nil {
			log.Println("GetUserSessionByToken Error: ", err)
			return errors.New("INVALID_TOKENS")
		}

		accesstokenJwt, accesstoken, err := authentication.CreateAndSignToken(session.UserID.String(), []byte(os.Getenv("JWT_ACCESSTOKEN_KEY")), uuid.NewString(), time.Now().Add(time.Hour))

		if err != nil {
			log.Println("CreateAndSignToken Error: ", err)
			return errors.New("INTERNAL_SERVER_ERROR")
		}

		wc.accesstoken = string(accesstoken)
		wc.accesstokenExpiresAt = accesstokenJwt.Expiration()
	}

	return nil
}

func (wc *WebsocketClient) AuthenticateClient(accesstoken string, refreshtoken string) error {

	accesstokenJwt, accesstokenID, err := authentication.ValidateToken(accesstoken, []byte(os.Getenv("JWT_ACCESSTOKEN_KEY")))

	if err != nil {
		return errors.New("INVALID_TOKENS")
	}

	refreshtokenJwt, refreshtokenID, err := authentication.ValidateToken(refreshtoken, []byte(os.Getenv("JWT_REFRESHTOKEN_KEY")))

	if err != nil {
		return errors.New("INVALID_TOKENS")
	}

	if accesstokenID != refreshtokenID {
		return errors.New("INVALID_TOKENS")
	}

	session, err := wc.hub.queries.GetUserSessionByToken(context.Background(), refreshtoken)

	if err != nil {
		if database.IsPGErrNoRows(err) {
			return errors.New("INVALID_SESSION")
		}
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	if _, ok := wc.hub.GetClient(refreshtokenID); ok {
		return errors.New("DUPLICATE_CONNECTION")
	}

	wc.authenticated = true
	wc.authDeadline.Stop()

	wc.id = session.UserID
	wc.accesstoken = accesstoken
	wc.refreshtoken = refreshtoken
	wc.accesstokenExpiresAt = accesstokenJwt.Expiration()
	wc.refreshtokenExpiresAt = refreshtokenJwt.Expiration()

	return nil
}

func (wc *WebsocketClient) AuthoriseClient(channelID uuid.UUID, permission int) error {
	permissions, err := wc.hub.queries.GetGuildRolePermissionsByUserIDAndChannelID(context.Background(), sqlc.GetGuildRolePermissionsByUserIDAndChannelIDParams{
		UserID:    wc.id,
		ChannelID: channelID,
	})

	if err != nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	if permissions == -1 {
		return errors.New("CHANNEL_NOT_FOUND")
	}

	if permissions&(1<<permission) == 0 {
		return errors.New("FORBIDDEN")
	}

	return nil
}

func (wc *WebsocketClient) ReadMessages() {
	wc.wConn.SetReadDeadline(time.Now().Add(wc.hub.pongWait))

	message := &IncomingWebsocketMessage{}
	for {
		_, p, err := wc.wConn.ReadMessage()

		if err != nil {
			log.Println("READ_MESSAGE_ERROR: ", err)
			wc.CloseMessage(websocket.ClosePolicyViolation, "INTERNAL_SERVER_ERROR")
			return
		}

		if err := json.Unmarshal(p, &message); err != nil {
			log.Println("PAYLOAD UNMARSHAL_ERROR: ", err)
			wc.CloseMessage(websocket.ClosePolicyViolation, "INVALID_AUTHENTICATION_PAYLOAD")
			return
		}

		fmt.Println("READ MESSAGE - OP: ", message.Op)

		switch message.Op {
		case "AUTHENTICATE_OP":

			if err := wc.AuthenticateClient(message.D.Accesstoken, message.D.Refreshtoken); err != nil {
				wc.CloseMessage(websocket.ClosePolicyViolation, err.Error())
				return
			}

			if err := wc.AuthoriseClient(message.D.ChannelID, constants.VIEW_GUILD_CHANNEL); err != nil {
				wc.CloseMessage(websocket.ClosePolicyViolation, err.Error())
				return
			}

			wc.hub.AddClient(wc)

			channel := wc.hub.CreateChannel(message.D.ChannelID, message.D.GuildID)
			err := channel.CreatePeer(wc)

			if err != nil {
				log.Println("CreatePeer Error: ", err.Error())
				wc.CloseMessage(websocket.ClosePolicyViolation, err.Error())
				return
			}

			sqlVoiceChannelState, err := wc.hub.queries.CreateVoiceChannelState(
				context.Background(),
				sqlc.CreateVoiceChannelStateParams{
					UserID:    wc.id,
					ChannelID: channel.id,
				})

			if err != nil {
				log.Println("CreateVoiceChannelState Error: ", err)
				wc.CloseMessage(websocket.ClosePolicyViolation, "INTERNAL_SERVER_ERROR")
				return
			}

			roleIDs, err := wc.hub.queries.GetRoleIDsByChannelID(context.Background(), channel.id)

			if err != nil {
				log.Println("GetRoleIDsByChannelID Error: ", err)
				wc.CloseMessage(websocket.ClosePolicyViolation, "INTERNAL_SERVER_ERROR")
				return
			}

			wc.hub.messageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
				Version: 0,
				Op:      "VOICE_CHANNEL_STATE_CREATE",
				RoleIDs: roleIDs,
				Data: &models.VoiceChannelState{
					SelfMute:  sqlVoiceChannelState.SelfMute,
					SelfDeaf:  sqlVoiceChannelState.SelfDeaf,
					ChannelID: sqlVoiceChannelState.ChannelID,
					GuildID:   sqlVoiceChannelState.GuildID,
					User: models.UserLimited{
						ID:          sqlVoiceChannelState.ID,
						Avatar:      goverter.PGTypeUUIDToNullableUUID(sqlVoiceChannelState.AttachmentID),
						DisplayName: sqlVoiceChannelState.DisplayName,
						Username:    sqlVoiceChannelState.Username,
						PublicFlags: sqlVoiceChannelState.PublicFlags,
					},
				},
			})

			channel.Signalpeers()

		case "SELF_MUTE":
			updatedVoiceChannelState, err := wc.hub.queries.UpdateVoiceChannelState(context.Background(), sqlc.UpdateVoiceChannelStateParams{
				SelfMute: message.D.SelfMute,
				UserID:   wc.id,
			})

			if err != nil {
				log.Println("GetRoleIDsByChannelID Error: ", err)
				wc.CloseMessage(websocket.ClosePolicyViolation, "INTERNAL_SERVER_ERROR")
				return
			}

			roleIDs, err := wc.hub.queries.GetRoleIDsByChannelID(context.Background(), wc.channel.id)

			if err != nil {
				log.Println("GetRoleIDsByChannelID Error: ", err)
				wc.CloseMessage(websocket.ClosePolicyViolation, "INTERNAL_SERVER_ERROR")
				return
			}

			wc.hub.messageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
				Version: 0,
				Op:      "VOICE_CHANNEL_STATE_UPDATE",
				RoleIDs: roleIDs,
				Data: &models.UpdatedVoiceChannelState{
					SelfMute:  updatedVoiceChannelState.SelfMute,
					SelfDeaf:  updatedVoiceChannelState.SelfDeaf,
					ChannelID: updatedVoiceChannelState.ChannelID,
					GuildID:   updatedVoiceChannelState.GuildID,
					UserID:    updatedVoiceChannelState.UserID,
				},
			})

		case "CANDIDATE":
			if err := wc.pConn.AddICECandidate(message.D.Candidate); err != nil {
				log.Println("AddICECandidate Error: ", err)
				wc.CloseMessage(websocket.ClosePolicyViolation, "INTERNAL_SERVER_ERROR")
				return
			}
		case "ANSWER":
			if err := wc.pConn.SetRemoteDescription(message.D.Answer); err != nil {
				log.Println("SetRemoteDescription Error: ", err)
				wc.CloseMessage(websocket.ClosePolicyViolation, "INTERNAL_SERVER_ERROR")
				return
			}
		}

	}
}

func (wc *WebsocketClient) HandlePing() {
	ticker := time.NewTicker(wc.hub.pingInterval)
	defer ticker.Stop()

	for {
		<-ticker.C
		if !wc.authenticated {
			continue
		}

		wc.wConn.SetWriteDeadline(time.Now().Add(wc.hub.writeWait))
		if err := wc.wConn.WriteMessage(websocket.PingMessage, nil); err != nil {
			wc.CloseMessage(websocket.ClosePolicyViolation, "WRITE_MESSAGE_FAILURE")
			return
		}

	}
}

func (wc *WebsocketClient) HandleLocalPayload() {

	defer func() {
		fmt.Println("RETURNING HANDLE_LOCAL_PAYLOAD FOR: ", wc.id)
	}()

	for {
		_, ok := <-wc.local

		// REAUTHORISE_CLIENTS

		if !ok {
			return
		}

	}
}
