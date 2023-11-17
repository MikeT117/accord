package rest_api

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/authentication"
	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type APIContext struct {
	echo.Context
	UserID       uuid.UUID
	Refreshtoken string
}

func (a *api) AuthenticationMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		accesstoken := strings.Replace(c.Request().Header.Get("Authorization"), "Bearer ", "", 1)
		refreshtoken := c.Request().Header.Get("X-App-Token")

		if _, userID, err := authentication.ValidateToken(accesstoken, []byte(os.Getenv("JWT_ACCESSTOKEN_KEY"))); err == nil {
			cctx := &APIContext{
				Context:      c,
				UserID:       userID,
				Refreshtoken: refreshtoken,
			}
			return next(cctx)
		}

		_, userID, err := authentication.ValidateToken(refreshtoken, []byte(os.Getenv("JWT_REFRESHTOKEN_KEY")))

		if err != nil {
			resp := NewClientError(nil, http.StatusUnauthorized, constants.DetailUnauthorized)
			return c.JSON(resp.Status, resp)
		}

		session, err := a.Queries.GetUserSessionByToken(c.Request().Context(), refreshtoken)

		if err != nil {
			if database.IsPGErrNoRows(err) {
				resp := NewClientError(nil, http.StatusUnauthorized, constants.DetailUnauthorized)
				return c.JSON(resp.Status, resp)
			}
			return NewServerError(err, " a.Queries.GetUserSessionByToken")
		}

		if session.UserID != userID {
			resp := NewClientError(nil, http.StatusUnauthorized, constants.DetailUnauthorized)
			return c.JSON(resp.Status, resp)
		}

		requestId := c.Response().Header().Get(echo.HeaderXRequestID)
		_, newAccesstoken, err := authentication.CreateAndSignToken(userID.String(), []byte(os.Getenv("JWT_ACCESSTOKEN_KEY")), requestId, time.Now().Add(time.Hour))

		if err != nil {
			resp := NewServerError(err, "Unable to Create/Sign tokens")
			return c.JSON(resp.Status, resp)
		}

		c.Response().Header().Set("Authorization", fmt.Sprintf("Bearer %s", newAccesstoken))

		cctx := &APIContext{
			Context:      c,
			UserID:       userID,
			Refreshtoken: refreshtoken,
		}

		return next(cctx)
	}
}

func (a *api) RequiredGuildPermission(permission int) func(next echo.HandlerFunc) echo.HandlerFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			guildID, err := uuid.Parse(c.Param("guild_id"))

			if err != nil {
				return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
			}

			permissions, err := a.Queries.GetGuildRolePermissionsByUserIDAndGuildID(c.Request().Context(), sqlc.GetGuildRolePermissionsByUserIDAndGuildIDParams{
				GuildID: guildID,
				UserID:  c.(*APIContext).UserID,
			})

			if err != nil {
				return NewServerError(err, "a.Queries.GetGuildRolePermissionsByUserAndGuildID")
			}

			if permissions == -1 {
				return NewClientError(nil, http.StatusNotFound, "guild not found")
			}

			if permissions&(1<<permission) == 0 {
				return NewClientError(nil, http.StatusUnauthorized, "you are not authorised to access this resource")
			}

			return next(c)
		}
	}
}

func (a *api) RequiredChannelPermission(permission int) func(next echo.HandlerFunc) echo.HandlerFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			channelID, err := uuid.Parse(c.Param("channel_id"))

			if err != nil {
				return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
			}

			userID := c.(*APIContext).UserID

			permissions, err := a.Queries.GetGuildRolePermissionsByUserIDAndChannelID(c.Request().Context(), sqlc.GetGuildRolePermissionsByUserIDAndChannelIDParams{
				ChannelID: channelID,
				UserID:    c.(*APIContext).UserID,
			})

			if err != nil {
				return NewServerError(err, "a.Queries.GetGuildRolePermissionsByUserAndChannelID")
			}

			if permissions == -1 {
				count, err := a.Queries.GetPrivateChannelUserByChannelIDAndUserID(c.Request().Context(), sqlc.GetPrivateChannelUserByChannelIDAndUserIDParams{
					ChannelID: channelID,
					UserID:    userID,
				})

				if err != nil {
					return NewServerError(err, "GetPrivateChannelMemberByChannelIDAndUserID")
				}

				if count == 1 {
					return next(c)
				}

				return NewClientError(nil, http.StatusNotFound, "channel not found")
			}

			if permissions&(1<<permission) == 0 {
				return NewClientError(nil, http.StatusUnauthorized, "you are not authorised to access this resource")
			}

			return next(c)
		}
	}
}
