package authentication

import (
	"github.com/labstack/echo/v4"
)

type AuthenticationContext struct {
	echo.Context
	RequestorID string
	SessionID   string
}

type RequestorIDKey struct{}

func GetRequestorDetails(ctx echo.Context) (string, string) {
	authenticationCtx, ok := ctx.(*AuthenticationContext)
	if !ok {
		panic("GetRequestorDetails called outside an authenticated context")
	}

	return authenticationCtx.RequestorID, authenticationCtx.SessionID
}
