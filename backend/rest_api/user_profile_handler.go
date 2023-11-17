package rest_api

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleUserProfileReadOne(c echo.Context) error {

	userID, err := uuid.Parse(c.Param("user_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid user ID")
	}

	if len(c.QueryParam("guild_id")) != 0 {

		// TODO: Check the user is a member / has the MEMBER_READ permission (new permission to be added)

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

func (a *api) HandleUserProfileUpdate(c echo.Context) error {

	body := UserProfileUpdateRequestBody{}

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	dbTx, err := a.Pool.Begin(c.Request().Context())

	if err != nil {
		return NewServerError(err, "Begin")
	}

	defer dbTx.Rollback(c.Request().Context())

	tx := a.Queries.WithTx(dbTx)

	sqlUser, err := tx.UpdateUser(c.Request().Context(), sqlc.UpdateUserParams{
		DisplayName: body.DisplayName,
		PublicFlags: body.PublicFlags,
		UserID:      c.(*APIContext).UserID,
	})

	if err != nil {
		return NewServerError(err, "UpdateUser")
	}

	updatedUser := a.Mapper.ConvertSQLCUpdateUserRowToUpdateUser(sqlUser)

	if body.Avatar != nil {
		rowsAffected, err := tx.LinkAttachmentToUser(c.Request().Context(), sqlc.LinkAttachmentToUserParams{
			UserID:       c.(*APIContext).UserID,
			AttachmentID: *body.Avatar,
		})

		if err != nil {
			return NewServerError(err, "tx.LinkAttachmentToGuild")
		}

		if rowsAffected != 1 {
			return NewServerError(nil, "tx.LinkAttachmentToGuild")
		}

		updatedUser.Avatar = body.Avatar
	}

	dbTx.Commit(c.Request().Context())

	return NewSuccessfulResponse(c, http.StatusOK, &updatedUser)
}
