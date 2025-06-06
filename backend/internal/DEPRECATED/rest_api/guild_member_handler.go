package rest_api

import (
	"net/http"
	"strconv"

	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleGuildMemberReadMany(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	params := &sqlc.GetManyGuildMembersByGuildIDParams{
		GuildID:      guildID,
		ResultsLimit: 30,
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

	sqlcGuildMembers, err := a.Queries.GetManyGuildMembersByGuildID(c.Request().Context(), *params)

	if err != nil {
		return NewServerError(err, "a.Queries.GetGuildMembers")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetManyGuildMembersByGuildIDRowToGuildMembers(sqlcGuildMembers))
}

func (a *api) HandleGuildMemberCreate(c echo.Context) error {

	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	if len(c.QueryParam("invite_id")) != 0 {
		inviteID, err := uuid.Parse(c.QueryParam("invite_id"))

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid invite ID")
		}

		sqlGuildInvite, err := a.Queries.GetGuildInviteByID(c.Request().Context(), inviteID)

		if sqlGuildInvite.GuildID != guildID {
			return NewClientError(err, http.StatusBadRequest, "invalid intvite for this guild")
		}
	} else {
		isDiscoverable, err := a.Queries.GetGuildDiscoverableStatusByID(c.Request().Context(), guildID)

		if err != nil {
			return NewServerError(err, "a.Queries.GetGuildDiscoverableStatusByID")
		}

		if !isDiscoverable {
			return NewClientError(err, http.StatusBadRequest, "this guild requires an invite to join")
		}
	}

	count, err := a.Queries.GetGuildBanCountByUserIDAndGuildID(c.Request().Context(), sqlc.GetGuildBanCountByUserIDAndGuildIDParams{
		GuildID: guildID,
		UserID:  c.(*CustomCtx).UserID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.GetGuildBanCountByUserIDAndGuildID")
	}

	if count != 0 {
		return NewClientError(nil, http.StatusBadRequest, "you have been banned from this guild")
	}

	dbtx, err := a.Pool.Begin(c.Request().Context())

	if err != nil {
		return NewServerError(err, "Begin")
	}

	defer dbtx.Rollback(c.Request().Context())

	tx := a.Queries.WithTx(dbtx)

	sqlGuildMember, err := tx.CreateGuildMember(c.Request().Context(), sqlc.CreateGuildMemberParams{
		UserID:  c.(*CustomCtx).UserID,
		GuildID: guildID,
	})

	if err != nil {
		return NewServerError(err, "tx.CreateGuildMember")
	}

	sqlDefaultRoleId, err := tx.AssignDefaultRoleToUser(c.Request().Context(), sqlc.AssignDefaultRoleToUserParams{
		UserID:  c.(*CustomCtx).UserID,
		GuildID: guildID,
	})

	if err != nil {
		return NewServerError(err, "tx.AssignRoleToGuildMember")
	}

	if err := tx.IncrementGuildMemberCount(c.Request().Context(), guildID); err != nil {
		return NewServerError(err, "tx.IncrementGuildMemberCount")
	}

	sqlUser, err := a.Queries.GetUserByID(c.Request().Context(), c.(*CustomCtx).UserID)

	if err != nil {
		return NewServerError(err, "tx.AssignRoleToGuildMember")
	}

	sqlGuildRoles, err := a.Queries.GetManyGuildRolesByGuildID(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "tx.AssignRoleToGuildMember")
	}

	sqlGuildChannels, err := a.Queries.GetManyGuildChannelsByGuildID(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "tx.AssignRoleToGuildMember")
	}

	sqlGuild, err := a.Queries.GetGuildByID(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "tx.AssignRoleToGuildMember")
	}

	dbtx.Commit(c.Request().Context())

	guildMember := a.Mapper.ConvertSQLCGuildMemberToGuildMember(sqlGuildMember)
	guildMember.Roles = []uuid.UUID{sqlDefaultRoleId}
	guild := a.Mapper.ConvertSQLCGetGuildByIDRowToGuild(sqlGuild)
	guildMember.User = a.Mapper.ConvertGetUserByIDRowToUser(sqlUser)
	guild.Member = guildMember
	guild.Channels = a.Mapper.ConvertSQLCGetManyGuildChannelsByGuildIDRowToGuildChannel(sqlGuildChannels)
	guild.Roles = a.Mapper.ConvertSQLCGuildRoleToGuildRoles(sqlGuildRoles)

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Version: 0,
		Op:      "GUILD_CREATE",
		UserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		Data:    guild,
	})

	a.MessageQueue.PublishLocalPayload(&message_queue.LocalPayload{
		Version: 0,
		Op:      "ADD_ROLE",
		UserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		RoleIDs: []uuid.UUID{sqlDefaultRoleId},
	})

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

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

func (a *api) HandleGuildMemberDelete(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	userID, err := uuid.Parse(c.Param("user_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid member ID")
	}

	roleIDs, err := a.Queries.GetManyGuildRoleIDsByUserID(c.Request().Context(), c.(*CustomCtx).UserID)

	if err != nil {
		return NewServerError(err, "GetManyGuildRoleIDsByUserID")
	}

	_, err = a.Queries.DeleteGuildMember(c.Request().Context(), sqlc.DeleteGuildMemberParams{
		UserID:  userID,
		GuildID: guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.DeleteGuildMember")
	}

	a.MessageQueue.PublishLocalPayload(&message_queue.LocalPayload{
		Op:      "ROLE_DELETE",
		Version: 0,
		UserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		RoleIDs: roleIDs,
	})

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:      "GUILD_DELETE",
		Version: 0,
		UserIDs: []uuid.UUID{userID},
		Data: &models.DeletedGuild{
			ID: guildID,
		},
	})

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildMemberLeave(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	roleIDs, err := a.Queries.GetManyGuildRoleIDsByUserID(c.Request().Context(), c.(*CustomCtx).UserID)

	if err != nil {
		return NewServerError(err, "GetManyGuildRoleIDsByUserID")
	}

	dbtx, err := a.Pool.Begin(c.Request().Context())

	if err != nil {
		return NewServerError(err, "Begin")
	}

	defer dbtx.Rollback(c.Request().Context())

	tx := a.Queries.WithTx(dbtx)

	_, err = tx.DeleteGuildMember(c.Request().Context(), sqlc.DeleteGuildMemberParams{
		UserID:  c.(*CustomCtx).UserID,
		GuildID: guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.DeleteGuildMember")
	}

	if err := tx.DecrementGuildMemberCount(c.Request().Context(), guildID); err != nil {
		return NewServerError(err, "tx.DecrementGuildMemberCount")
	}

	dbtx.Commit(c.Request().Context())

	a.MessageQueue.PublishLocalPayload(&message_queue.LocalPayload{
		Op:      "ROLE_DELETE",
		Version: 0,
		UserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		RoleIDs: roleIDs,
	})

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}
