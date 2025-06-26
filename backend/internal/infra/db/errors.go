package db

import (
	"errors"
	"fmt"
)

var (
	ErrUnknown = errors.New("unknown error")
)

func wrapUnknownErr(msg string, err error) error {
	return fmt.Errorf("%s: %w", msg, err)
}
