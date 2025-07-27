package websocket_api

import (
	"context"
	"log"
	"sync"
	"time"

	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"github.com/MikeT117/accord/backend/internal/interface/api/authentication"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"google.golang.org/protobuf/proto"
)

const (
	AUTH_TIMEOUT                 = time.Second * 10
	PING_INTERVAL                = time.Second * 30
	PONG_WAIT                    = time.Second * 45
	WRITE_WAIT                   = time.Second * 5
	CLOSE_UNKNOWN                = 4000
	CLOSE_AUTHENTICATION_TIMEOUT = 4001
	CLOSE_AUTHENTICATION_FAILED  = 4002
	CLOSE_SESSION_EXPIRED        = 4003
)

type Client struct {
	hub          *Hub
	id           uuid.UUID
	send         chan []byte
	ctx          context.Context
	done         context.CancelFunc
	conn         *websocket.Conn
	userID       string
	roleIDs      SafeRWMutexMap[map[string]bool]
	token        string
	authDeadline *time.Timer
}

func (h *Hub) HandleNewClient(conn *websocket.Conn, hub *Hub) {
	id, err := uuid.NewUUID()
	if err != nil {
		conn.Close()
		log.Println("Err: creating client failed, uuid failure", err)
		return
	}

	ctx, done := context.WithCancel(h.ctx)
	client := &Client{
		ctx:  ctx,
		hub:  hub,
		id:   id,
		send: make(chan []byte),
		done: done,
		conn: conn,
		roleIDs: SafeRWMutexMap[map[string]bool]{
			Mutex: sync.RWMutex{},
			Data:  make(map[string]bool),
		},
		authDeadline: nil,
	}

	client.conn.SetReadDeadline(time.Now().Add(PONG_WAIT))

	client.authDeadline = time.AfterFunc(AUTH_TIMEOUT, func() {
		if client.token == "" {
			client.shutdown(CLOSE_AUTHENTICATION_TIMEOUT)
		}
	})

	client.conn.SetCloseHandler(func(code int, text string) error {
		client.done()
		return nil
	})

	go client.handleRead()
	go client.handleWrite()
}

func (c *Client) hasRoles(roleIDs []string) bool {
	c.roleIDs.Mutex.RLock()
	defer c.roleIDs.Mutex.RUnlock()

	for i := 0; i < len(roleIDs); i++ {
		if _, present := c.roleIDs.Data[roleIDs[i]]; present {
			return true
		}
	}

	return false
}

func (c *Client) matchesUserIDs(userIDs []string) bool {
	for i := 0; i < len(userIDs); i++ {
		if c.matchesUserID(userIDs[i]) {
			return true
		}
	}

	return false
}

func (c *Client) matchesUserID(userID string) bool {
	return c.userID == userID
}

func (c *Client) addRole(roleID string) {
	c.roleIDs.Mutex.Lock()
	defer c.roleIDs.Mutex.Unlock()
	c.roleIDs.Data[roleID] = true
}

func (c *Client) deleteRole(roleID string) {
	c.roleIDs.Mutex.Lock()
	defer c.roleIDs.Mutex.Unlock()
	delete(c.roleIDs.Data, roleID)
}

func (c *Client) authenticateUser(msg []byte) error {
	var clientEvent pb.ClientEvent
	err := proto.Unmarshal(msg, &clientEvent)
	if err != nil {
		return err
	}

	if clientEvent.GetOp().Enum() == nil || *clientEvent.GetOp().Enum() != *pb.OpCode_IDENTIFY.Enum() {
		log.Println(*clientEvent.GetOp().Enum() == *pb.OpCode_IDENTIFY.Enum())
		return ErrInvalidOpCode
	}

	if clientEvent.GetIdentify().Refreshtoken == nil {
		return ErrInvalidPayload
	}

	_, userID, err := authentication.ValidateToken(*clientEvent.GetIdentify().Refreshtoken, c.hub.config.JWTRefreshtokenKey)
	if err != nil {
		return err
	}

	sessionValid, err := c.hub.websocketService.ValidateSession(context.Background(), *clientEvent.GetIdentify().Refreshtoken)
	if err != nil {
		return err
	}

	if !sessionValid {
		return ErrInvalidSession
	}

	c.userID = userID
	c.token = *clientEvent.GetIdentify().Refreshtoken
	return nil
}

func (c *Client) sendUserInitPayload() error {
	initialisationPayload, err := c.hub.websocketService.GetInitialisationPayload(c.ctx, c.userID)
	if err != nil {
		return err
	}

	var ver int32 = 0
	data, err := proto.Marshal(&pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_INIT.Enum(),
		Payload: &pb.EventPayload_Initialisation{
			Initialisation: initialisationPayload,
		},
	})
	if err != nil {
		return err
	}

	c.send <- data
	return nil
}

func (c *Client) getUserInitRoles() error {
	roleIDs, err := c.hub.websocketService.GetUserRoleIDs(c.ctx, c.userID)
	if err != nil {
		return err
	}

	for i := 0; i < len(roleIDs); i++ {
		c.addRole(roleIDs[i])
	}

	return nil
}

func (c *Client) shutdown(code int) {
	c.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(code, ""))
	c.done()
	c.hub.deleteClient(c.id)
}

func (c *Client) handleWrite() {
	ticker := time.NewTicker(PING_INTERVAL)
	defer func() {
		ticker.Stop()
	}()

	for {
		select {
		case <-c.ctx.Done():
			return
		case <-ticker.C:
			c.writeMessage(websocket.PingMessage, nil)
		case msg := <-c.send:
			c.writeMessage(websocket.BinaryMessage, msg)
		}
	}
}

func (c *Client) writeMessage(msgType int, payload []byte) {
	c.conn.SetWriteDeadline(time.Now().Add(WRITE_WAIT))
	if err := c.conn.WriteMessage(msgType, payload); err != nil {
		c.shutdown(CLOSE_UNKNOWN)
	}
}

func (c *Client) handleRead() {
	c.conn.SetReadDeadline(time.Now().Add(PONG_WAIT))
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(PONG_WAIT))
	})

	for {
		select {
		case <-c.ctx.Done():
			return
		default:
			_, p, err := c.conn.ReadMessage()
			if err != nil {
				log.Println("ERR: read message on client connection failed", err)
				c.shutdown(CLOSE_UNKNOWN)
				return
			}

			if c.token != "" {
				continue
			}

			if err := c.authenticateUser(p); err != nil {
				log.Println("ERR: authenticate user failed", err)
				c.shutdown(CLOSE_AUTHENTICATION_FAILED)
				return
			}

			if err := c.getUserInitRoles(); err != nil {
				log.Println("ERR: get user init roles failed", err)
				c.shutdown(CLOSE_UNKNOWN)
				return
			}

			if err := c.sendUserInitPayload(); err != nil {
				log.Println("ERR: sending init payload to user failed", err)
				c.shutdown(CLOSE_UNKNOWN)
				return
			}

			c.hub.addClient(c)
		}
	}
}
