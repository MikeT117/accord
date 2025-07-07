package websocket_api

import (
	"errors"
)

var (
	ErrInvalidPayload = errors.New("invalid payload")
	ErrInvalidOpCode  = errors.New("invalid op code")
	ErrInvalidSession = errors.New("invalid session")
)

var (
	ErrUnknown = errors.New("unknown error")
)
