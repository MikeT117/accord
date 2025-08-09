package authentication

import (
	"log"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type AuthenticationContext struct {
	echo.Context
	RequestorID uuid.UUID
	SessionID   uuid.UUID
}

type RequestorIDKey struct{}

func GetRequestorDetails(ctx echo.Context) (uuid.UUID, uuid.UUID) {
	authenticationCtx, ok := ctx.(*AuthenticationContext)
	/*
		We're panicking here as this will never get called outside an authenticated context,
		if we get a panic we've made a mistake somewhere.
	*/
	if !ok {
		log.Panic("GetRequestorDetails called outside an authenticated context")
	}

	return authenticationCtx.RequestorID, authenticationCtx.SessionID
}
