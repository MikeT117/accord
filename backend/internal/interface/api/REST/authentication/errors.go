package authentication

import (
	"errors"
	"fmt"
)

var (
	ErrInvalidTokens = errors.New("invalid tokens")
	ErrUnknownErr    = errors.New("unknown error occurred")
)

func IsInvalidTokensErr(err error) bool {
	return errors.Is(err, ErrInvalidTokens)
}

func wrapUnknownErr(msg string, err error) error {
	return fmt.Errorf("%s: %w", msg, err)
}
