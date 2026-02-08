package web_rtc_voice

import (
	"log"
	"sync"
	"time"

	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"github.com/gorilla/websocket"
	"google.golang.org/protobuf/proto"
)

type Websocket struct {
	client *Client

	conn  *websocket.Conn
	queue chan []byte

	once sync.Once
}

func (c *Client) CreateWebsocket(conn *websocket.Conn) {
	c.websocket = &Websocket{
		client: c,

		conn:  conn,
		queue: make(chan []byte),

		once: sync.Once{},
	}

	if err := conn.SetReadDeadline(time.Now().Add(PONG_WAIT)); err != nil {
		log.Println(err)
		c.shutdown()
		return
	}

	conn.SetCloseHandler(func(code int, text string) error {
		c.shutdown()
		return nil
	})

	go c.websocket.writer()
	go c.websocket.reader(c.handleEvents)
}

func (w *Websocket) shutdown() {
	w.once.Do(func() {
		if w.client.getState() == ClientAuthenticated {
			log.Printf("WEBSOCKET FOR AUTHENTICATED CLIENT %s SHUTTING DOWN\n", w.client.id.String())
		} else {
			log.Println("WEBSOCKET FOR UNAUTHENTICATED CLIENT SHUTTING DOWN")
		}

		if w.conn != nil {
			w.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(CLOSE_UNKNOWN, ""))
			w.conn.Close()
		}

		close(w.queue)
	})
}

func (w *Websocket) send(data []byte) bool {
	if w.conn == nil {
		return false
	}

	select {
	case <-w.client.ctx.Done():
		return false
	case w.queue <- data:
		return true
	}
}

func (w *Websocket) reader(handler func(data *pb.WebRTCEvent)) {
	if err := w.conn.SetReadDeadline(time.Now().Add(PONG_WAIT)); err != nil {
		log.Println("SetReadDeadlineErr: ", err)
		w.client.shutdown()
	}

	w.conn.SetPongHandler(func(string) error {
		return w.conn.SetReadDeadline(time.Now().Add(PONG_WAIT))
	})

	for {
		select {
		case <-w.client.ctx.Done():
			return
		default:
			_, p, err := w.conn.ReadMessage()
			if err != nil {
				log.Println("ReadMessageErr: read message on client connection failed", err)
				w.client.shutdown()
				return
			}

			webrtcEvent := &pb.WebRTCEvent{}
			err = proto.Unmarshal(p, webrtcEvent)
			if err != nil {
				log.Println("UnmarshalErr: parse message on client connection failed", err)
				w.client.shutdown()
				return
			}

			if webrtcEvent.GetOp().Enum() == nil {
				w.client.shutdown()
				return
			}

			handler(webrtcEvent)
		}
	}
}

func (w *Websocket) writer() {
	ticker := time.NewTicker(PING_INTERVAL)
	defer ticker.Stop()

	for {
		select {
		case <-w.client.ctx.Done():
			return
		case <-ticker.C:
			w.writeMessage(websocket.PingMessage, nil)
		case msg, ok := <-w.queue:
			if !ok {
				return
			}
			w.writeMessage(websocket.BinaryMessage, msg)
		}
	}
}

func (w *Websocket) writeMessage(msgType int, payload []byte) {
	if err := w.conn.SetWriteDeadline(time.Now().Add(WRITE_WAIT)); err != nil {
		log.Println("SetWriteDeadlineErr: ", err)
		w.client.shutdown()
	}

	if err := w.conn.WriteMessage(msgType, payload); err != nil {
		log.Println("WriteMessageErr: ", err)
		w.client.shutdown()
	}
}
