package rest_api

import (
	"net/http"
	"strconv"

	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleGuildInviteReadMany(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	params := &sqlc.GetManyGuildInvitesByGuildIDParams{
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

	sqlGuildInvites, err := a.Queries.GetManyGuildInvitesByGuildID(c.Request().Context(), *params)

	if err != nil {
		return NewServerError(err, "a.Queries.GetGuildInvitesByGuildID")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetManyGuildInvitesByGuildIDRowToGuildInvites(sqlGuildInvites))
}

func (a *api) HandleGuildInviteCreate(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	inviteID, err := a.Queries.CreateGuildInvite(c.Request().Context(), sqlc.CreateGuildInviteParams{
		UserID:  c.(*CustomCtx).UserID,
		GuildID: guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.CreateGuildInvite")
	}

	return NewSuccessfulResponse(c, http.StatusOK, &inviteID)
}

func (a *api) HandleGuildInviteDelete(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	inviteID, err := uuid.Parse(c.Param("invite_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid invite ID")
	}

	rowsAffected, err := a.Queries.DeleteGuildInvite(c.Request().Context(), sqlc.DeleteGuildInviteParams{
		GuildID:       guildID,
		GuildInviteID: inviteID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.DeleteGuildInvite")
	}

	if rowsAffected != 1 {
		return NewClientError(nil, http.StatusNotFound, "invite not found")
	}

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildInviteReadOne(c echo.Context) error {
	inviteID, err := uuid.Parse(c.Param("invite_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid invite ID")
	}

	sqlGuildInvite, err := a.Queries.GetGuildInviteByID(c.Request().Context(), inviteID)

	if err != nil {
		return NewServerError(err, "a.Queries.DeleteGuildInvite")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetGuildInviteByIDRowToGuildInviteLimited(sqlGuildInvite))
}
