package websocket_api

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"os"
	"slices"
	"sync"
	"time"

	"github.com/MikeT117/accord/backend/internal/authentication"
	"github.com/MikeT117/accord/backend/internal/database"
	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/internal/utils"
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

type ForwardedClientPayload struct {
	Op   string      `json:"op"`
	Data interface{} `json:"d"`
}

type WebsocketClient struct {
	id                    uuid.UUID
	userID                uuid.UUID
	hub                   *WebsocketHub
	conn                  *websocket.Conn
	forward               chan *message_queue.ForwardedPayload
	local                 chan *message_queue.LocalPayload
	authenticated         bool
	accesstoken           string
	refreshtoken          string
	accesstokenExpiresAt  time.Time
	refreshtokenExpiresAt time.Time
	roleIDs               utils.SafeRWMutexMap[map[uuid.UUID]bool]
	authDeadline          *time.Timer
}

func (wh *WebsocketHub) CreateClient(conn *websocket.Conn) {
	wc := &WebsocketClient{
		id:            uuid.New(),
		hub:           wh,
		conn:          conn,
		authenticated: false,
		forward:       make(chan *message_queue.ForwardedPayload),
		local:         make(chan *message_queue.LocalPayload),
		roleIDs: utils.SafeRWMutexMap[map[uuid.UUID]bool]{
			Mutex: sync.RWMutex{},
			Data:  make(map[uuid.UUID]bool),
		},
	}

	wc.conn.SetPongHandler(func(string) error {
		if err := wc.conn.SetReadDeadline(time.Now().Add(wc.hub.pongWait)); err != nil {
			wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "PONG_TIMEOUT"))
			return err
		}
		return nil
	})

	wc.conn.SetCloseHandler(func(code int, text string) error {
		close(wc.forward)
		close(wc.local)
		wc.hub.DelClient(wc.id)
		return nil
	})

	go wc.ReadMessages()
	go wc.HandlePing()
	go wc.HandleForwardedPayload()
	go wc.HandleLocalPayload()

	wc.authDeadline = time.AfterFunc(wc.hub.authTimeout, func() {
		if !wc.authenticated {
			wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "AUTHENTICATION_TIMEOUT"))
		}
	})
}

func (wc *WebsocketClient) AddRoles(roleIDs []uuid.UUID) {
	wc.roleIDs.Mutex.Lock()
	defer wc.roleIDs.Mutex.Unlock()
	for _, roleID := range roleIDs {
		wc.roleIDs.Data[roleID] = true
	}
}

func (wc *WebsocketClient) DelRoles(roleIDs []uuid.UUID) {
	wc.roleIDs.Mutex.Lock()
	defer wc.roleIDs.Mutex.Unlock()
	for roleID := range wc.roleIDs.Data {
		if slices.Contains[[]uuid.UUID, uuid.UUID](roleIDs, roleID) {
			delete(wc.roleIDs.Data, roleID)
		}
	}
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

	_, err = wc.hub.queries.GetUserSessionByToken(context.Background(), refreshtoken)

	if err != nil {
		if database.IsPGErrNoRows(err) {
			return errors.New("INVALID_SESSION")
		}
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	wc.authenticated = true
	wc.authDeadline.Stop()

	wc.userID = accesstokenID
	wc.accesstoken = accesstoken
	wc.refreshtoken = refreshtoken
	wc.accesstokenExpiresAt = accesstokenJwt.Expiration()
	wc.refreshtokenExpiresAt = refreshtokenJwt.Expiration()

	return nil
}

func (wc *WebsocketClient) ValidateTokens() error {
	if wc.accesstokenExpiresAt.Before(time.Now().Add(time.Minute * 5)) {
		log.Println("REFRESHING ACCESSTOKN")
		if wc.refreshtokenExpiresAt.Before(time.Now()) {
			return errors.New("EXPIRED_TOKENS")
		}

		session, err := wc.hub.queries.GetUserSessionByToken(context.Background(), wc.refreshtoken)

		if err != nil {
			log.Printf("GetUserSessionByToken err: %v\n", err)
			return errors.New("INTERNAL_SERVER_ERROR")
		}

		accesstokenJwt, accesstoken, err := authentication.CreateAndSignToken(
			session.UserID.String(),
			[]byte(os.Getenv("JWT_ACCESSTOKEN_KEY")),
			uuid.NewString(),
			time.Now().Add(time.Hour),
		)

		if err != nil {
			log.Printf("CreateAndSignToken err: %v\n", err)
			return errors.New("INTERNAL_SERVER_ERROR")
		}

		wc.accesstoken = string(accesstoken)
		wc.accesstokenExpiresAt = accesstokenJwt.Expiration()
	}

	return nil
}

func (wc *WebsocketClient) RetrieveAuthenticatedClientRoles() error {
	roleIDs, err := wc.hub.queries.GetManyGuildRoleIDsByUserID(context.Background(), wc.userID)

	if err != nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	wc.AddRoles(roleIDs)
	return nil
}

func (wc *WebsocketClient) ReadMessages() {
	wc.conn.SetReadDeadline(time.Now().Add(wc.hub.pongWait))

	for {
		_, p, err := wc.conn.ReadMessage()

		if err != nil {
			log.Printf("READ_MESSAGE_ERROR: %v\n", err)
			wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "INTERNAL_SERVER_ERROR"))
			return
		}

		if !wc.authenticated {
			authenticatePayload := AuthenticatePayload{}

			if err := json.Unmarshal(p, &authenticatePayload); err != nil {
				log.Printf("PAYLOAD UNMARSHAL_ERROR: %v\n", err)
				wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "INVALID_AUTHENTICATION_PAYLOAD"))
				return
			}

			if authenticatePayload.Op != "AUTHENTICATE_OP" {
				log.Printf("INVALID_OPERATION: %v\n", err)
				wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "INVALID_AUTHENTICATION_PAYLOAD"))
				return
			}

			if err := wc.AuthenticateClient(authenticatePayload.D.Accesstoken, authenticatePayload.D.Refreshtoken); err != nil {
				wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, err.Error()))
				return
			}

			if err := wc.RetrieveAuthenticatedClientRoles(); err != nil {
				wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, err.Error()))
				return
			}

			if err := wc.SendInitialisationPayload(); err != nil {
				wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, err.Error()))
				return
			}

			wc.hub.AddClient(wc)
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

		wc.conn.SetWriteDeadline(time.Now().Add(wc.hub.writeWait))
		if err := wc.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
			wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "WRITE_MESSAGE_FAILURE"))
			return
		}

	}
}

func (wc *WebsocketClient) HandleLocalPayload() {
	for {
		msg, ok := <-wc.local

		if !ok {
			return
		}

		if len(msg.RoleIDs) < 1 {
			continue
		}

		switch msg.Op {
		case "ADD_ROLE":
			wc.AddRoles(msg.RoleIDs)
		case "DEL_ROLE":
			wc.DelRoles(msg.RoleIDs)
		default:
			log.Printf("Unknown local payload Op: %s\n", msg.Op)
		}
	}
}

func (wc *WebsocketClient) HandleForwardedPayload() {
	for {
		msg, ok := <-wc.forward

		if !ok {
			return
		}

		if !wc.authenticated || slices.Contains(msg.ExcludedUserIDs, wc.userID) {
			continue
		}

		if err := wc.ValidateTokens(); err != nil {
			wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, err.Error()))
			return
		}

		if len(msg.RoleIDs) != 0 {
			wc.roleIDs.Mutex.RLock()
			for idx := range msg.RoleIDs {
				if !wc.roleIDs.Data[msg.RoleIDs[idx]] {
					continue
				}

				wc.roleIDs.Mutex.RUnlock()

				wc.conn.SetWriteDeadline(time.Now().Add(wc.hub.writeWait))
				if err := wc.conn.WriteJSON(ForwardedClientPayload{Op: msg.Op, Data: msg.Data}); err != nil {
					wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "WRITE_MESSAGE_FAILURE"))
					return
				}

				break
			}
		} else if len(msg.UserIDs) != 0 {
			for idx := range msg.UserIDs {
				if wc.userID != msg.UserIDs[idx] {
					continue
				}

				wc.conn.SetWriteDeadline(time.Now().Add(wc.hub.writeWait))
				if err := wc.conn.WriteJSON(ForwardedClientPayload{Op: msg.Op, Data: msg.Data}); err != nil {
					wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "WRITE_MESSAGE_FAILURE"))
					return
				}

				break
			}
		}
	}
}

func (wc *WebsocketClient) SendInitialisationPayload() error {

	InitData, err := wc.hub.queries.GetWebsocketInitialisationPayload(context.Background(), wc.userID)

	if err != nil {
		log.Printf("GetWebsocketInitialisationPayload ERR: %v\n", err)
		return err
	}

	wc.conn.SetWriteDeadline(time.Now().Add(wc.hub.writeWait))
	if err := wc.conn.WriteJSON(struct {
		Op string                                    `json:"op"`
		D  sqlc.GetWebsocketInitialisationPayloadRow `json:"d"`
	}{
		Op: "CLIENT_READY",
		D:  InitData,
	}); err != nil {
		return err
	}

	return nil
}
