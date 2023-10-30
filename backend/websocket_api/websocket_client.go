package websocket_api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/MikeT117/accord/backend/internal/authentication"
	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type AuthenticatePayload struct {
	Op string `json:"op"`
	D  struct {
		Accesstoken  string `json:"accesstoken"`
		Refreshtoken string `json:"refreshtoken"`
	} `json:"d"`
}

type WebsocketClient struct {
	websocketHub          *WebsocketHub
	conn                  *websocket.Conn
	id                    uuid.UUID
	authenticated         bool
	accesstoken           string
	refreshtoken          string
	accesstokenExpiresAt  time.Time
	refreshtokenExpiresAt time.Time
	roles                 map[string]bool
	authTimeout           time.Duration
	pingInterval          time.Duration
	pongWait              time.Duration
	writeWait             time.Duration
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

		session, err := wc.websocketHub.queries.GetUserSessionByToken(context.Background(), wc.refreshtoken)

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

	session, err := wc.websocketHub.queries.GetUserSessionByToken(context.Background(), refreshtoken)

	if err != nil {
		if database.IsPGErrNoRows(err) {
			wc.CloseMessage(1003, "INVALID_SESSION")
		} else {
			wc.CloseMessage(1002, "INTERNAL_SERVER_ERROR")
		}
		return
	}

	if wc.websocketHub.GetClientByID(refreshtokenID) != nil {
		wc.CloseMessage(1003, "DUPLICATE_CONNECTION")
		return
	}

	roles, err := wc.websocketHub.queries.GetManyGuildRoleIDsByUserID(context.Background(), session.UserID)

	if err != nil {
		wc.CloseMessage(1002, "INTERNAL_SERVER_ERROR")
		return
	}

	roleIDs := make(map[string]bool)

	for i := range roles {
		roleIDs[roles[i].String()] = true
	}

	wc.authenticated = true
	wc.id = accesstokenID
	wc.accesstoken = accesstoken
	wc.refreshtoken = refreshtoken
	wc.accesstokenExpiresAt = accesstokenJwt.Expiration()
	wc.refreshtokenExpiresAt = refreshtokenJwt.Expiration()
	wc.roles = roleIDs

	wc.websocketHub.RegisterClient(wc)
	wc.SendInitialisationPayload()
}

func (wc *WebsocketClient) ReadMessages() {

	wc.conn.SetReadDeadline(time.Now().Add(wc.pongWait))

	for {
		_, p, err := wc.conn.ReadMessage()
		fmt.Println("READ_MESSAGE_EXECUTING")

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error unexpected close: %v\n", err)
			} else {
				log.Printf("Unknown error: %v\n", err)
			}
			return
		}

		if !wc.authenticated {
			authenticatePayload := AuthenticatePayload{}

			if err := json.Unmarshal(p, &authenticatePayload); err != nil {
				log.Printf("UNABLE_TO_PARSE_MESSAGE\n")
				wc.CloseMessage(1003, "INVALID_AUTHENTICATION_PAYLOAD")
				return
			}

			if authenticatePayload.Op != "AUTHENTICATE_OP" {
				log.Printf("INVALID OP\n")
				wc.CloseMessage(1003, "INVALID_AUTHENTICATION_PAYLOAD")
				return
			}

			wc.Identify(authenticatePayload.D.Accesstoken, authenticatePayload.D.Refreshtoken)
		}
	}
}

func (wc *WebsocketClient) WriteMessages() {

	ticker := time.NewTicker(wc.pingInterval)

	defer func() {
		ticker.Stop()
	}()

	for {
		select {
		case <-ticker.C:
			fmt.Println("SENDING_PING")
			wc.conn.SetWriteDeadline(time.Now().Add(wc.writeWait))
			if err := wc.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				wc.CloseMessage(1002, "PING_FAILURE")
				return
			}
		case msg := <-wc.websocketHub.forward:
			if !wc.authenticated {
				continue
			}

			if err := wc.CheckTokens(); err != nil {
				log.Printf("Tokens check failed: %v\n", err.Error())
				wc.CloseMessage(1002, "REAUTHENTICATION_REQUIRED")
				return
			}

			if len(msg.RoleIDs) != 0 {
				fmt.Println("CHECKING ROLEIDS")
				for idx := range msg.RoleIDs {
					if wc.roles[msg.RoleIDs[idx]] {
						wc.conn.SetWriteDeadline(time.Now().Add(wc.writeWait))
						payload, _ := json.Marshal(msg.Data)
						wc.conn.WriteMessage(websocket.TextMessage, payload)
						break
					}
				}
			} else if len(msg.UserIDs) != 0 {
				fmt.Println("CHECKING USERIDS")
				for idx := range msg.UserIDs {
					if wc.id.String() == msg.UserIDs[idx] {
						wc.conn.SetWriteDeadline(time.Now().Add(wc.writeWait))
						payload, _ := json.Marshal(msg.Data)
						wc.conn.WriteMessage(websocket.TextMessage, payload)
						break
					}
				}
			}
		}
	}
}

func (wc *WebsocketClient) SendInitialisationPayload() {

	InitData, err := wc.websocketHub.queries.GetWebsocketInitialisationPayload(context.Background(), wc.id)

	if err != nil {
		fmt.Printf("GetInitialGuilds err: %v\n", err)
		wc.CloseMessage(1002, "INTERNAL_SERVER_ERROR")
		return
	}

	wc.conn.WriteJSON(struct {
		Op string                                    `json:"op"`
		D  sqlc.GetWebsocketInitialisationPayloadRow `json:"d"`
	}{
		Op: "CLIENT_READY_OP",
		D:  InitData,
	})

}

func CreateWebsocketClient(websocketHub *WebsocketHub, conn *websocket.Conn) {

	wc := &WebsocketClient{
		websocketHub:  websocketHub,
		conn:          conn,
		authenticated: false,
		authTimeout:   time.Duration(10 * time.Second),
		pingInterval:  time.Duration(15 * time.Second),
		pongWait:      time.Duration(20 * time.Second),
		writeWait:     time.Duration(5 * time.Second),
	}

	wc.conn.SetPongHandler(func(string) error {
		fmt.Println("RECIEVING_PONG")
		if err := wc.conn.SetReadDeadline(time.Now().Add(wc.pongWait)); err != nil {
			log.Printf("PONG_ERROR: %v\n", err.Error())
			wc.CloseMessage(1002, "PONG_TIMEOUT")
		}
		return nil
	})

	wc.conn.SetCloseHandler(func(code int, text string) error {
		fmt.Printf("CLOSE_HANDLER - Reason: %s\n", text)
		wc.conn.Close()
		if wc.authenticated {
			wc.websocketHub.unregister <- wc.id
		}
		return nil
	})

	go wc.ReadMessages()
	go wc.WriteMessages()

	time.Sleep(wc.authTimeout)

	if !wc.authenticated {
		log.Printf("AUTHENTICATION_DEADLINE_REACHED\n")
		wc.CloseMessage(1002, "AUTHENTICATION_TIMEOUT")
	}
}
