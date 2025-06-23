package response

import (
	"net/http"

	"github.com/bytedance/sonic"
	"github.com/labstack/echo/v4"
)

type APIError struct {
	Error  string `json:"error"`
	Code   int    `json:"code,omitempty"`
	Detail any    `json:"detail,omitempty"`
}

func TemporaryRedirect(ctx echo.Context, url string) error {
	return ctx.Redirect(http.StatusTemporaryRedirect, url)
}

func JSONResponse(ctx echo.Context, status int, val interface{}) error {
	json, err := sonic.Marshal(val)

	if err != nil {
		return ctx.String(status, "internal server error")
	}

	return ctx.JSONBlob(http.StatusOK, json)
}

func ErrorResponse(ctx echo.Context, code int, detail any) error {
	json, err := sonic.Marshal(&APIError{
		Error:  http.StatusText(code),
		Code:   code,
		Detail: detail,
	})

	if err != nil {
		return ctx.String(code, "internal server error")
	}

	return ctx.JSONBlob(code, json)
}

func NoContentResponse(ctx echo.Context) error {
	return ctx.NoContent(http.StatusNoContent)
}
