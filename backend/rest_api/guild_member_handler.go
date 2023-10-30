package rest_api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleGuildMemberRead(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	params := &sqlc.GetManyGuildMembersByGuildIDParams{
		GuildID:      guildID,
		ResultsLimit: 30,
	}

	if len(c.QueryParam("before")) != 0 {
		i, err := strconv.ParseInt(c.QueryParam("before"), 10, 64)

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
		}

		params.Before = pgtype.Timestamp{
			Time:  time.Unix(i, 0),
			Valid: true,
		}
	}

	if len(c.QueryParam("after")) != 0 {
		i, err := strconv.ParseInt(c.QueryParam("after"), 10, 64)

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
		}

		params.After = pgtype.Timestamp{
			Time:  time.Unix(i, 0),
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

	sqlcGuildMembers, err := a.Queries.GetManyGuildMembersByGuildID(c.Request().Context(), *params)

	if err != nil {
		return NewServerError(err, "a.Queries.GetGuildMembers")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetManyGuildMembersByGuildIDRowToGuildMembers(sqlcGuildMembers))
}

// TODO: Fire GUILD_MEMBER_UPDATE - all properties are included
func (a *api) HandleGuildMemberUpdate(c echo.Context) error {

	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	userID, err := uuid.Parse(c.Param("user_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid member ID")
	}

	var body GuildMemberUpdateBody

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	rowsAffected, err := a.Queries.UpdateGuildMember(c.Request().Context(), sqlc.UpdateGuildMemberParams{
		Nickname: body.Nickname,
		UserID:   userID,
		GuildID:  guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.UpdateGuildMember")
	}

	if rowsAffected != 1 {
		return NewClientError(nil, http.StatusBadRequest, "member not found")
	}

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

// TODO: Fire GUILD_MEMBER_DELETE - ID, GuildID included
func (a *api) HandleGuildMemberDelete(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	userID, err := uuid.Parse(c.Param("user_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid member ID")
	}

	_, err = a.Queries.DeleteGuildMember(c.Request().Context(), sqlc.DeleteGuildMemberParams{
		UserID:  userID,
		GuildID: guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.DeleteGuildMember")
	}

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildBansRead(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	params := &sqlc.GetManyGuildBansByGuildIDParams{
		GuildID: guildID,
	}

	if len(c.QueryParam("before")) != 0 {
		i, err := strconv.ParseInt(c.QueryParam("before"), 10, 64)

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
		}

		params.Before = pgtype.Timestamp{
			Time:  time.Unix(i, 0),
			Valid: true,
		}
	}

	if len(c.QueryParam("after")) != 0 {
		i, err := strconv.ParseInt(c.QueryParam("after"), 10, 64)

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
		}

		params.After = pgtype.Timestamp{
			Time:  time.Unix(i, 0),
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

	rowsAffected, err := a.Queries.CreateGuildBan(c.Request().Context(), sqlc.CreateGuildBanParams{
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
