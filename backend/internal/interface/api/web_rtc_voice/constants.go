package web_rtc_voice

import (
	"time"
)

const (
	AUTH_TIMEOUT                 = time.Second * 10
	PING_INTERVAL                = time.Second * 30
	PONG_WAIT                    = time.Second * 45
	WRITE_WAIT                   = time.Second * 5
	CLOSE_NORMAL                 = 1001
	CLOSE_UNKNOWN                = 4000
	CLOSE_AUTHENTICATION_TIMEOUT = 4001
	CLOSE_AUTHENTICATION_FAILED  = 4002
	CLOSE_SESSION_EXPIRED        = 4003
	CLOSE_INVALID_OP             = 4004
	CLOSE_INVALID_PAYLOAD        = 4005
)
