package rest_api

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleUserProfileRead(c echo.Context) error {

	userID, err := uuid.Parse(c.Param("user_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid user ID")
	}

	if len(c.QueryParam("guild_id")) != 0 {

		// Check the user is a member / has the MEMBER_READ permission (new permission to be added)

		guildID, err := uuid.Parse(c.QueryParam("guild_id"))

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
		}

		sqlUserProfile, err := a.Queries.GetUserProfileByIDAndGuildID(c.Request().Context(), sqlc.GetUserProfileByIDAndGuildIDParams{
			UserID:      userID,
			GuildID:     guildID,
			RequestorID: c.(*APIContext).UserID,
		})

		if err != nil {
			return NewServerError(err, "GetUserProfileByIDAndGuildID")
		}

		return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetUserProfileByIDAndGuildIDRowToUserProfileWithGuildMember(sqlUserProfile))
	}

	sqlUserProfile, err := a.Queries.GetUserProfileByID(c.Request().Context(), sqlc.GetUserProfileByIDParams{
		UserID:      userID,
		RequestorID: c.(*APIContext).UserID,
	})

	if err != nil {
		return NewServerError(err, "GetUserProfileByID")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetUserProfileByIDRowToUserProfile(sqlUserProfile))
}
