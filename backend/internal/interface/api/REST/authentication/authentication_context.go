package authentication

import (
	"github.com/labstack/echo/v4"
)

type AuthenticationContext struct {
	echo.Context
	UserID string
}
