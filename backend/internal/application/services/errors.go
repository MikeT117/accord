package services

import (
	"errors"
)

var (
	ErrNotAuthorised      = errors.New("not authorised")
	ErrInvalidChannelType = errors.New("invalid channel type")
)

func IsServiceNotAuthorisedErr(err error) bool {
	return errors.Is(err, ErrNotAuthorised)
}

func IsInvalidChannelTypeErr(err error) bool {
	return errors.Is(err, ErrInvalidChannelType)
}
