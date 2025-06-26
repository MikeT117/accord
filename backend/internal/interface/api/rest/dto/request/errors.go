package request

import "errors"

type RequestValidationError struct {
	Msg string
}

func (e *RequestValidationError) Error() string { return e.Msg }
func NewRequestValidationError(msg string) *RequestValidationError {
	return &RequestValidationError{Msg: msg}
}

func IsRequestValidationErr(err error) bool {
	var validationErr *RequestValidationError
	return errors.As(err, &validationErr)
}
