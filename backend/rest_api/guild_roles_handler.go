package rest_api

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleGuildRoleCreate(c echo.Context) error {

	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid guild ID")
	}

	sqlRole, err := a.Queries.CreatGuildRole(c.Request().Context(), sqlc.CreatGuildRoleParams{
		Name:        "New-Role",
		CreatorID:   c.(*APIContext).UserID,
		GuildID:     guildID,
		Permissions: 0,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.GetGuildRolesByGuildID")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGuildRoleToGuildRole(sqlRole))
}

func (a *api) HandleGuildRoleUpdate(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid guild ID")
	}

	roleID, err := uuid.Parse(c.Param("role_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid role ID")
	}

	var body GuildRoleUpdateRequestBody

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	sqlGuildRole, err := a.Queries.UpdateGuildRole(c.Request().Context(), sqlc.UpdateGuildRoleParams{
		Name:        body.Name,
		Permissions: body.Permissions,
		RoleID:      roleID,
		GuildID:     guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.UpdateGuildRole")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGuildRoleToGuildRole(sqlGuildRole))
}

func (a *api) HandleGuildRoleDelete(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid guild ID")
	}

	roleID, err := uuid.Parse(c.Param("role_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid role ID")
	}

	rowsAffected, err := a.Queries.DeleteGuildRole(c.Request().Context(), sqlc.DeleteGuildRoleParams{
		RoleID:  roleID,
		GuildID: guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.DeleteGuildRole")
	}

	if rowsAffected == 0 {
		return NewClientError(nil, http.StatusNotFound, "Role not found")
	}

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildRoleMemberReadMany(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	roleID, err := uuid.Parse(c.Param("role_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	assignable, err := strconv.ParseBool(c.QueryParam("assignable"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid query")
	}

	fmt.Printf("Assignable: %t", assignable)

	if assignable {

		params := &sqlc.GetManyAssignableGuildMembersByGuildIDAndRoleIDParams{
			GuildID:      guildID,
			RoleID:       roleID,
			ResultsLimit: 50,
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

		sqlcGuildMembers, err := a.Queries.GetManyAssignableGuildMembersByGuildIDAndRoleID(c.Request().Context(), *params)

		if err != nil {
			return NewServerError(err, "a.Queries.GetGuildMembers")
		}

		return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetManyAssignableGuildMembersByRoleIDAndGuildIDRowToGuildMembers(sqlcGuildMembers))
	}
	params := &sqlc.GetManyUnassignableGuildMembersByGuildIDAndRoleIDParams{
		GuildID:      guildID,
		RoleID:       roleID,
		ResultsLimit: 50,
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

	sqlcGuildMembers, err := a.Queries.GetManyUnassignableGuildMembersByGuildIDAndRoleID(c.Request().Context(), *params)

	if err != nil {
		return NewServerError(err, "a.Queries.GetGuildMembers")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetManyUnassignableGuildMembersByRoleIDAndGuildIDRowToGuildMembers(sqlcGuildMembers))
}

func (a *api) HandleGuildRoleMemberCreate(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid guild ID")
	}

	roleID, err := uuid.Parse(c.Param("role_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid role ID")
	}

	var body GuildRoleMemberCreateBody

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid member ID")
	}

	reqCtx := c.Request().Context()
	dbtx, err := a.Pool.Begin(reqCtx)

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer dbtx.Rollback(reqCtx)
	tx := a.Queries.WithTx(dbtx)

	rowsAffected, err := tx.AssignRoleToManyUsers(reqCtx, sqlc.AssignRoleToManyUsersParams{
		RoleID:  roleID,
		UserIds: body.UserIDs,
		GuildID: guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.AssignRoleToGuildMember")
	}

	if rowsAffected != int64(len(body.UserIDs)) {
		return NewClientError(nil, http.StatusBadRequest, "Invalid member IDs")
	}

	dbtx.Commit(reqCtx)

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildRoleMemberDelete(c echo.Context) error {
	roleID, err := uuid.Parse(c.Param("role_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid role ID")
	}

	userID, err := uuid.Parse(c.Param("user_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid member ID")
	}

	reqCtx := c.Request().Context()
	dbtx, err := a.Pool.Begin(reqCtx)

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer dbtx.Rollback(reqCtx)
	tx := a.Queries.WithTx(dbtx)

	rowsAffected, err := tx.UnassignRoleFromUser(reqCtx, sqlc.UnassignRoleFromUserParams{
		RoleID: roleID,
		UserID: userID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.AssignRoleToGuildMember")
	}

	if rowsAffected != 1 {
		return NewClientError(nil, http.StatusBadRequest, "Invalid member ID")
	}

	dbtx.Commit(reqCtx)

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildRoleChannelCreate(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid guild ID")
	}

	roleID, err := uuid.Parse(c.Param("role_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid role ID")
	}

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid role ID")
	}

	rowsAffected, err := a.Queries.AssignRoleToManyGuildChannels(c.Request().Context(), sqlc.AssignRoleToManyGuildChannelsParams{
		RoleID:     roleID,
		ChannelIds: []uuid.UUID{channelID},
		GuildID:    guildID,
	})

	if err != nil {
		if database.IsPGErrorConstraint(err, "guild_role_channels_pkey") {
			return NewClientError(err, http.StatusBadRequest, "role already assigned")
		}
		return NewServerError(err, "a.Queries.AssignRoleToGuildMember")
	}

	if rowsAffected != int64(1) {
		return NewClientError(nil, http.StatusBadRequest, "Invalid channel IDs")
	}

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildRoleChannelDelete(c echo.Context) error {
	roleID, err := uuid.Parse(c.Param("role_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid role ID")
	}

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid channel ID")
	}

	reqCtx := c.Request().Context()
	dbtx, err := a.Pool.Begin(reqCtx)

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer dbtx.Rollback(reqCtx)
	tx := a.Queries.WithTx(dbtx)

	rowsAffected, err := tx.UnassignRoleFromGuildChannel(reqCtx, sqlc.UnassignRoleFromGuildChannelParams{
		RoleID:    roleID,
		ChannelID: channelID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.AssignRoleToGuildMember")
	}

	if rowsAffected != 1 {
		return NewClientError(nil, http.StatusBadRequest, "Invalid channel ID")
	}

	dbtx.Commit(reqCtx)

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}
