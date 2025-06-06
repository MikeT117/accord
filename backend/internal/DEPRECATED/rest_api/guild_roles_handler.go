package rest_api

import (
	"fmt"
	"net/http"
	"slices"
	"strconv"
	"time"

	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
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
		CreatorID:   c.(*CustomCtx).UserID,
		GuildID:     guildID,
		Permissions: 0,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.GetGuildRolesByGuildID")
	}

	defaultRoleID, err := a.Queries.GetDefaultGuildRole(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "a.Queries.GetDefaultGuildRole")
	}

	role := a.Mapper.ConvertSQLCGuildRoleToGuildRole(sqlRole)

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:              "ROLE_CREATE",
		Version:         0,
		RoleIDs:         []uuid.UUID{defaultRoleID},
		ExcludedUserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		Data:            role,
	})

	return NewSuccessfulResponse(c, http.StatusOK, &role)
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

	defaultRoleID, err := a.Queries.GetDefaultGuildRole(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "a.Queries.GetDefaultGuildRole")
	}

	role := a.Mapper.ConvertSQLCGuildRoleToGuildRole(sqlGuildRole)

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:              "ROLE_UPDATE",
		Version:         0,
		RoleIDs:         []uuid.UUID{defaultRoleID},
		ExcludedUserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		Data:            &role,
	})

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

	defaultRoleID, err := a.Queries.GetDefaultGuildRole(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "a.Queries.GetDefaultGuildRole")
	}

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:              "ROLE_DELETE",
		Version:         0,
		RoleIDs:         []uuid.UUID{defaultRoleID},
		ExcludedUserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		Data: &models.DeleteGuildRole{
			ID:      roleID,
			GuildID: guildID,
		},
	})

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
			timestamp, err := strconv.ParseInt(c.QueryParam("before"), 10, 64)

			if err != nil {
				return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
			}

			params.Before = pgtype.Timestamp{
				Time:  time.Unix(timestamp, 0),
				Valid: true,
			}
		}

		if len(c.QueryParam("after")) != 0 {
			timestamp, err := strconv.ParseInt(c.QueryParam("after"), 10, 64)

			if err != nil {
				return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
			}

			params.Before = pgtype.Timestamp{
				Time:  time.Unix(timestamp, 0),
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

	rowsAffected, err := a.Queries.AssignRoleToManyUsers(c.Request().Context(), sqlc.AssignRoleToManyUsersParams{
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

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:      "ROLE_MEMBER_CREATE",
		Version: 0,
		UserIDs: body.UserIDs,
		Data: &models.GuildRoleMemberCreate{
			GuildID: guildID,
			RoleID:  roleID,
		},
	})

	a.MessageQueue.PublishLocalPayload(&message_queue.LocalPayload{
		Version: 0,
		Op:      "ADD_ROLE",
		UserIDs: body.UserIDs,
		RoleIDs: []uuid.UUID{roleID},
	})

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildRoleMemberDelete(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid guild ID")
	}

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

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:      "ROLE_MEMBER_DELETE",
		Version: 0,
		UserIDs: []uuid.UUID{userID},
		Data: &models.GuildRoleMemberCreate{
			GuildID: guildID,
			RoleID:  roleID,
		},
	})

	a.MessageQueue.PublishLocalPayload(&message_queue.LocalPayload{
		Version: 0,
		Op:      "DEL_ROLE",
		UserIDs: []uuid.UUID{userID},
		RoleIDs: []uuid.UUID{roleID},
	})

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

	roleIds, err := a.Queries.GetRoleIDsByChannelID(c.Request().Context(), channelID)

	if err != nil {
		return NewServerError(err, "GetRoleIDsByChannelID")
	}

	if slices.Contains(roleIds, roleID) {
		return NewClientError(nil, http.StatusBadRequest, "role already assigned")
	}

	channel, err := a.Queries.GetGuildChannelByID(c.Request().Context(), sqlc.GetGuildChannelByIDParams{
		ChannelID: channelID,
		GuildID:   guildID,
	})

	if err != nil {
		if database.IsPGErrNoRows(err) {
			return NewClientError(err, http.StatusNotFound, "Channel not found")
		}
		return NewServerError(err, "GetGuildChannelByID")
	}

	dbTx, err := a.Pool.Begin(c.Request().Context())
	if err != nil {
		return NewServerError(err, "TX")
	}

	defer dbTx.Rollback(c.Request().Context())
	tx := a.Queries.WithTx(dbTx)

	channelIDs := []uuid.UUID{channelID}
	if channel.ChannelType == 1 {
		childChannelIDs, err := a.Queries.GetSyncedChannelIDsByParentID(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetSyncedChannelIDsByParentID")
		}

		channelIDs = append(channelIDs, childChannelIDs...)
	}

	rowsAffected, err := tx.AssignRoleToManyGuildChannels(c.Request().Context(), sqlc.AssignRoleToManyGuildChannelsParams{
		ChannelIds: channelIDs,
		RoleID:     roleID,
		GuildID:    guildID,
	})

	if err != nil {
		if database.IsPGErrorConstraint(err, "guild_role_channels_pkey") {
			return NewClientError(err, http.StatusBadRequest, "role already assigned")
		}
		return NewServerError(err, "a.Queries.AssignRoleToGuildMember")
	}

	if rowsAffected != int64(len(channelIDs)) {
		return NewServerError(nil, "AssignRoleToManyGuildChannels")
	}

	defaultRoleID, err := a.Queries.GetDefaultGuildRole(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "a.Queries.GetDefaultGuildRole")
	}

	dbTx.Commit(c.Request().Context())

	for i := range channelIDs {
		a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
			Op:      "CHANNEL_UPDATE",
			Version: 0,
			RoleIDs: []uuid.UUID{defaultRoleID},
			Data: &models.UpdatedGuildChannelRoles{
				ID:      channelIDs[i],
				GuildID: guildID,
				Roles:   append(roleIds, roleID),
			},
		})
	}

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildRoleChannelDelete(c echo.Context) error {
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

	roleIds, err := a.Queries.GetRoleIDsByChannelID(c.Request().Context(), channelID)

	if err != nil {
		return NewServerError(err, "GetRoleIDsByChannelID")
	}

	if !slices.Contains(roleIds, roleID) {
		return NewClientError(nil, http.StatusBadRequest, "role not assigned")
	}

	channel, err := a.Queries.GetGuildChannelByID(c.Request().Context(), sqlc.GetGuildChannelByIDParams{
		ChannelID: channelID,
		GuildID:   guildID,
	})

	if err != nil {
		if database.IsPGErrNoRows(err) {
			return NewClientError(err, http.StatusNotFound, "Channel not found")
		}
		return NewServerError(err, "GetGuildChannelByID")
	}

	dbTx, err := a.Pool.Begin(c.Request().Context())
	if err != nil {
		return NewServerError(err, "TX")
	}

	defer dbTx.Rollback(c.Request().Context())
	tx := a.Queries.WithTx(dbTx)

	channelIDs := []uuid.UUID{channelID}
	if channel.ChannelType == 1 {
		childChannelIDs, err := a.Queries.GetSyncedChannelIDsByParentID(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetSyncedChannelIDsByParentID")
		}

		channelIDs = append(channelIDs, childChannelIDs...)
	}

	rowsAffected, err := tx.UnassignRoleFromManyGuildChannels(c.Request().Context(), sqlc.UnassignRoleFromManyGuildChannelsParams{
		RoleID:     roleID,
		ChannelIds: channelIDs,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.UnassignRoleToManyGuildChannels")
	}

	if rowsAffected != int64(len(channelIDs)) {
		return NewServerError(nil, "UnassignRoleFromManyGuildChannels")
	}

	defaultRoleID, err := a.Queries.GetDefaultGuildRole(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "a.Queries.GetDefaultGuildRole")
	}

	dbTx.Commit(c.Request().Context())

	for i := range channelIDs {
		a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
			Op:      "CHANNEL_UPDATE",
			Version: 0,
			RoleIDs: []uuid.UUID{defaultRoleID},
			Data: &models.UpdatedGuildChannelRoles{
				ID:      channelIDs[i],
				GuildID: guildID,
				Roles: slices.DeleteFunc[[]uuid.UUID, uuid.UUID](roleIds, func(id uuid.UUID) bool {
					return id == roleID
				}),
			},
		})
	}

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}
