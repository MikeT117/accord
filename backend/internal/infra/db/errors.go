package db

import (
	"errors"
	"fmt"
)

var (
	ErrNotFound = errors.New("entity not found")
	ErrUnknown  = errors.New("unknown error")
)

func wrapUnknownErr(msg string, err error) error {
	return fmt.Errorf("%s: %w", msg, err)
}
