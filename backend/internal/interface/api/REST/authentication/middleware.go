package authentication

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/response"
	"github.com/labstack/echo/v4"
)

func CreateAuthenticationMiddleware(config *config.Config, sessionService interfaces.SessionService) func(echo.HandlerFunc) echo.HandlerFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			accesstoken := strings.Replace(c.Request().Header.Get("Authorization"), "Bearer ", "", 1)
			refreshtoken := c.Request().Header.Get("X-App-Token")

			if _, requestorID, err := ValidateToken(accesstoken, []byte(config.JWTAccesstokenKey)); err == nil {
				cctx := &AuthenticationContext{
					Context:     c,
					RequestorID: requestorID,
				}
				return next(cctx)
			}

			_, requestorID, err := ValidateToken(refreshtoken, []byte(config.JWTRefreshtokenKey))
			if err != nil {
				return response.ErrorResponse(c, http.StatusUnauthorized, nil)
			}

			session, err := sessionService.GetByToken(c.Request().Context(), refreshtoken)
			if err != nil {
				if errors.Is(err, domain.ErrEntityNotFound) {
					return c.String(
						http.StatusUnauthorized,
						constants.DetailUnauthorized,
					)
				}

				return response.ErrorResponse(c, http.StatusInternalServerError, nil)
			}

			if session.Result.UserID != requestorID {
				return response.ErrorResponse(c, http.StatusUnauthorized, nil)
			}

			_, newAccesstoken, err := CreateAndSignToken(
				config.JWTIssuer,
				requestorID,
				config.JWTAccesstokenKey,
				c.Response().Header().Get(echo.HeaderXRequestID),
				time.Now().Add(time.Hour),
			)
			if err != nil {
				return response.ErrorResponse(c, http.StatusInternalServerError, nil)
			}

			c.Response().Header().Set("Authorization", fmt.Sprintf("Bearer %s", newAccesstoken))

			cctx := &AuthenticationContext{
				Context:     c,
				RequestorID: requestorID,
				SessionID:   session.Result.ID,
			}

			return next(cctx)
		}
	}
}
