package rest_api

import (
	"net/http"
	"strconv"

	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleGuildBansReadMany(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	params := &sqlc.GetManyGuildBansByGuildIDParams{
		GuildID: guildID,
	}

	if len(c.QueryParam("before")) != 0 {
		id, err := uuid.Parse(c.QueryParam("before"))

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
		}

		params.Before = pgtype.UUID{
			Bytes: id,
			Valid: true,
		}
	}

	if len(c.QueryParam("after")) != 0 {
		id, err := uuid.Parse(c.QueryParam("after"))

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
		}

		params.After = pgtype.UUID{
			Bytes: id,
			Valid: true,
		}
	}

	if len(c.QueryParam("limit")) != 0 {
		i, err := strconv.ParseInt(c.QueryParam("limit"), 10, 64)

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid limit")
		}

		if i > 50 {
			return NewClientError(nil, http.StatusBadRequest, "invalid limit")
		}

		params.ResultsLimit = i
	}

	sqlcGuildBans, err := a.Queries.GetManyGuildBansByGuildID(c.Request().Context(), *params)

	if err != nil {
		return NewServerError(err, "a.Queries.GetBannedGuildMembers")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetManyGuildBansByGuildIDRowToGuildBans(sqlcGuildBans))
}

func (a *api) HandleGuildBanCreate(c echo.Context) error {

	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	userID, err := uuid.Parse(c.Param("user_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid member ID")
	}

	var body BannedGuildMemberCreateBody

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	dbtx, err := a.Pool.Begin(c.Request().Context())

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer dbtx.Rollback(c.Request().Context())

	tx := a.Queries.WithTx(dbtx)

	rowsAffected, err := tx.CreateGuildBan(c.Request().Context(), sqlc.CreateGuildBanParams{
		Reason:    body.Reason,
		UserID:    userID,
		GuildID:   guildID,
		CreatorID: c.(*APIContext).UserID,
	})

	if err != nil {
		if database.IsPGErrorConstraint(err, "guild_bans_pkey") {
			return NewClientError(nil, http.StatusBadRequest, "member already banned")
		}
		return NewServerError(err, "a.Queries.BanGuildMember")
	}

	if rowsAffected != 1 {
		return NewClientError(err, http.StatusBadRequest, "invalid member ID")
	}

	_, err = tx.DeleteGuildMember(c.Request().Context(), sqlc.DeleteGuildMemberParams{
		UserID:  userID,
		GuildID: guildID,
	})

	if err != nil {
		return NewServerError(err, "tx.DeleteGuildMember")
	}

	roleIDs, err := tx.UnassignAllRolesFromUser(c.Request().Context(), sqlc.UnassignAllRolesFromUserParams{
		UserID:  userID,
		GuildID: guildID,
	})

	if err != nil {
		return NewServerError(err, "tx.DeleteGuildMember")
	}

	a.MessageQueue.PublishLocalPayload(&message_queue.LocalPayload{
		Op:      "ROLE_DELETE",
		Version: 0,
		UserIDs: []uuid.UUID{c.(*APIContext).UserID},
		Data:    roleIDs,
	})

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:      "GUILD_DELETE",
		Version: 0,
		UserIDs: []uuid.UUID{c.(*APIContext).UserID},
		Data: &models.DeletedGuild{
			ID: guildID,
		},
	})

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildBanDelete(c echo.Context) error {

	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	userID, err := uuid.Parse(c.Param("user_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid member ID")
	}

	rowsAffected, err := a.Queries.DeleteGuildBan(c.Request().Context(), sqlc.DeleteGuildBanParams{
		UserID:  userID,
		GuildID: guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.BanGuildMember")
	}

	if rowsAffected != 1 {
		return NewClientError(err, http.StatusBadRequest, "member not banned")
	}

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}
