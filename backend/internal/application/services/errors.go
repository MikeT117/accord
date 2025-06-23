package services

import (
	"errors"
)

var (
	ErrNotAuthorised = errors.New("not authorised")
)

func IsServiceNotAuthorisedErr(err error) bool {
	return errors.Is(err, ErrNotAuthorised)
}
