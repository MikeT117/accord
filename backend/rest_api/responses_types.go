package rest_api

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type SuccessfulResponse struct {
	Status     int               `json:"status"`
	Successful bool              `json:"successful"`
	Data       interface{}       `json:"data"`
	Headers    map[string]string `json:"-"`
}

func NewSuccessfulResponse(c echo.Context, status int, data interface{}) error {
	return c.JSON(status, &SuccessfulResponse{
		Status:     status,
		Successful: true,
		Data:       data,
	})
}

type UnsuccessfulResponse interface {
	GetStatus() int
	Error() string
}

type ClientErrorResponse struct {
	Status     int    `json:"status"`
	Successful bool   `json:"successful"`
	Detail     string `json:"detail"`
	Cause      error  `json:"-"`
}

func (e *ClientErrorResponse) Error() string {
	if e.Cause == nil {
		return e.Detail
	}
	return e.Detail + " : " + e.Cause.Error()
}

func (e *ClientErrorResponse) GetStatus() int {
	return e.Status
}

func NewClientError(err error, status int, detail string) *ClientErrorResponse {
	return &ClientErrorResponse{
		Cause:      err,
		Detail:     detail,
		Successful: false,
		Status:     status,
	}
}

type ServerErrorResponse struct {
	Status     int    `json:"status"`
	Successful bool   `json:"successful"`
	Detail     string `json:"-"`
	Cause      error  `json:"-"`
}

func (e *ServerErrorResponse) Error() string {
	if e.Cause == nil {
		return e.Detail
	}
	return e.Detail + " : " + e.Cause.Error()
}

func (e *ServerErrorResponse) GetStatus() int {
	return e.Status
}

func NewServerError(err error, detail string) *ServerErrorResponse {
	return &ServerErrorResponse{
		Cause:      err,
		Detail:     detail,
		Successful: false,
		Status:     http.StatusInternalServerError,
	}
}
