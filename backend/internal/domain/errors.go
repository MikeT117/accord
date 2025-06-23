package domain

import "errors"

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEntityNotFound     = errors.New("entity not found")
)

type DomainValidationError struct {
	Msg string
}

func (e *DomainValidationError) Error() string { return e.Msg }
func NewDomainValidationError(msg string) *DomainValidationError {
	return &DomainValidationError{Msg: msg}
}

func IsDomainValidationErr(err error) bool {
	var validationErr *DomainValidationError
	return errors.As(err, &validationErr)
}

func IsDomainNotFoundErr(err error) bool {
	return errors.Is(err, ErrEntityNotFound)
}

func IsDomainInvalidCredentialsErr(err error) bool {
	return errors.Is(err, ErrInvalidCredentials)
}
