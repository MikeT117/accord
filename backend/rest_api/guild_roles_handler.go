package rest_api

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleGuildRoleRead(c echo.Context) error {

	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid guild ID")
	}

	sqlRoles, err := a.Queries.GetManyGuildRolesByGuildID(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "a.Queries.GetGuildRolesByGuildID")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGuildRoleToGuildRoles(sqlRoles))
}

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

	role, err := a.Queries.UpdateGuildRole(c.Request().Context(), sqlc.UpdateGuildRoleParams{
		Name:        body.Name,
		Permissions: body.Permissions,
		RoleID:      roleID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.UpdateGuildRole")
	}

	return NewSuccessfulResponse(c, http.StatusOK, &role)
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

	var body GuildRoleChannelCreateBody

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

	rowsAffected, err := tx.AssignRoleToManyGuildChannels(reqCtx, sqlc.AssignRoleToManyGuildChannelsParams{
		RoleID:     roleID,
		ChannelIds: body.ChannelIDs,
		GuildID:    guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.AssignRoleToGuildMember")
	}

	if rowsAffected != int64(len(body.ChannelIDs)) {
		return NewClientError(nil, http.StatusBadRequest, "Invalid channel IDs")
	}

	dbtx.Commit(reqCtx)

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildRoleChannelDelete(c echo.Context) error {
	roleID, err := uuid.Parse(c.Param("role_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid role ID")
	}

	channelID, err := uuid.Parse(c.Param("channel_id"))

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
