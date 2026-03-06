package rest

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/interface/api/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
	"github.com/labstack/echo/v4"
)

func CreateAuthenticationMiddleware(config *config.Config, sessionService interfaces.SessionService) func(echo.HandlerFunc) echo.HandlerFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			accesstoken := strings.Replace(c.Request().Header.Get("Authorization"), "Bearer ", "", 1)
			refreshtoken := c.Request().Header.Get("X-App-Token")

			if _, requestorID, err := authentication.ValidateToken(accesstoken, config.JWTAccesstokenKey); err == nil {
				cctx := &authentication.AuthenticationContext{
					Context:     c,
					RequestorID: requestorID,
				}
				return next(cctx)
			}

			_, requestorID, err := authentication.ValidateToken(refreshtoken, config.JWTRefreshtokenKey)
			if err != nil {
				log.Printf("%s\n\n%s", refreshtoken, err.Error())
				return response.ErrorResponse(c, http.StatusUnauthorized, "invalid tokens")
			}

			session, err := sessionService.GetByToken(c.Request().Context(), refreshtoken)
			if err != nil {

				if errors.Is(err, domain.ErrEntityNotFound) {
					return response.ErrorResponse(c, http.StatusUnauthorized, "invalid tokens")
				}

				return response.ErrorResponse(c, http.StatusInternalServerError, "invalid tokens")
			}

			if session.Result.UserID != requestorID {
				return response.ErrorResponse(c, http.StatusUnauthorized, "invalid tokens")
			}

			_, newAccesstoken, err := authentication.CreateAndSignToken(
				config.Host,
				requestorID,
				config.JWTAccesstokenKey,
				c.Response().Header().Get(echo.HeaderXRequestID),
				time.Now().Add(time.Hour),
			)
			if err != nil {
				return response.ErrorResponse(c, http.StatusInternalServerError, nil)
			}

			c.Response().Header().Set("Authorization", fmt.Sprintf("Bearer %s", newAccesstoken))

			cctx := &authentication.AuthenticationContext{
				Context:     c,
				RequestorID: requestorID,
				SessionID:   session.Result.ID,
			}

			return next(cctx)
		}
	}
}
