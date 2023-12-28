package rest_api

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleGuildChannelCreate(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	var body GuildChannelCreateBody

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	createGuildChannelParams := sqlc.CreateGuildChannelParams{
		Topic:       body.Topic,
		Name:        body.Name,
		CreatorID:   c.(*CustomCtx).UserID,
		ChannelType: body.ChannelType,
		GuildID: pgtype.UUID{
			Bytes: guildID,
			Valid: true,
		},
	}

	reqCtx := c.Request().Context()
	dbtx, err := a.Pool.Begin(reqCtx)

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer dbtx.Rollback(reqCtx)
	tx := a.Queries.WithTx(dbtx)

	sqlGuildChannel, err := tx.CreateGuildChannel(reqCtx, createGuildChannelParams)

	if err != nil {
		return NewServerError(err, "a.Queries.CreateGuildChannel")
	}

	guildChannel := a.Mapper.ConvertSQLCChannelToGuildChannel(sqlGuildChannel)
	guildChannel.Roles = []uuid.UUID{}

	if len(body.Roles) != 0 {

		rowsAffected, err := tx.AssignManyRolesToGuildChannel(reqCtx, sqlc.AssignManyRolesToGuildChannelParams{
			ChannelID: guildChannel.ID,
			GuildID:   guildID,
			RoleIds:   body.Roles,
		})

		if err != nil {
			return NewServerError(err, "tx.AssignDefaultRoleToGuildChannels")
		}

		if rowsAffected != int64(len(body.Roles)) {
			return NewClientError(nil, http.StatusBadRequest, "role not found")
		}

		guildChannel.Roles = append(guildChannel.Roles, body.Roles...)

	}

	if !body.IsPrivate {
		sqlDefaultGuildRoleID, err := tx.AssignDefaultRoleToManyGuildChannels(reqCtx, sqlc.AssignDefaultRoleToManyGuildChannelsParams{
			ChannelIds: []uuid.UUID{sqlGuildChannel.ID},
			GuildID:    guildID,
		})

		if err != nil {
			return NewServerError(err, "tx.AssignDefaultRoleToGuildChannels")
		}

		guildChannel.Roles = append(guildChannel.Roles, sqlDefaultGuildRoleID)
	}

	sqlOwnerGuildRoleID, err := tx.AssignOwnerRoleToManyGuildChannels(reqCtx, sqlc.AssignOwnerRoleToManyGuildChannelsParams{
		ChannelIds: []uuid.UUID{sqlGuildChannel.ID},
		GuildID:    guildID,
	})

	if err := tx.IncrementGuildChannelCount(c.Request().Context(), guildID); err != nil {
		return NewServerError(err, "tx.IncrementGuildChannelCount")
	}

	dbtx.Commit(reqCtx)

	if err != nil {
		return NewServerError(err, "tx.AssignDefaultRoleToGuildChannels")
	}

	guildChannel.Roles = append(guildChannel.Roles, sqlOwnerGuildRoleID)

	defaultRoleID, err := a.Queries.GetDefaultGuildRole(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "a.Queries.GetDefaultGuildRole")
	}

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:              "CHANNEL_CREATE",
		Version:         0,
		RoleIDs:         []uuid.UUID{defaultRoleID},
		ExcludedUserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		Data:            &guildChannel,
	})

	return NewSuccessfulResponse(c, http.StatusOK, &guildChannel)
}

func (a *api) HandleGuildChannelUpdate(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	body := GuildChannelUpdateRequestBody{}

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	channel, err := a.Queries.GetGuildChannelByID(c.Request().Context(), sqlc.GetGuildChannelByIDParams{
		ChannelID: channelID,
		GuildID:   guildID,
	})

	if err != nil {
		if database.IsPGErrNoRows(err) {
			return NewClientError(err, http.StatusNotFound, "channel not found")
		}
		return NewServerError(err, "a.Queries.GetGuildChannelByID")
	}

	if channel.ChannelType > 0 && channel.ChannelType < 4 {
		return NewClientError(err, http.StatusBadRequest, "invalid channel")
	}

	/*
		If the channel already has no parent and the request
		is to set the parent to null this is a no-op.
	*/
	if !channel.ParentID.Valid && !body.ParentID.Valid {
		return NewSuccessfulResponse(c, http.StatusOK, nil)
	}

	/*
		Verify the parent ID is for a valid channel
	*/
	if body.ParentID.Valid {
		parentChannel, err := a.Queries.GetGuildChannelByID(c.Request().Context(), sqlc.GetGuildChannelByIDParams{
			ChannelID: body.ParentID.Bytes,
			GuildID:   guildID,
		})

		if err != nil {
			if database.IsPGErrNoRows(err) {
				return NewClientError(err, http.StatusNotFound, "parent channel not found")
			}
			return NewServerError(err, "a.Queries.GetGuildChannelByID")
		}

		if parentChannel.ChannelType != 1 {
			return NewClientError(err, http.StatusBadRequest, "invalid parent channel")
		}
	}

	dbtx, err := a.Pool.Begin(c.Request().Context())

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer dbtx.Rollback(c.Request().Context())
	tx := a.Queries.WithTx(dbtx)

	_, err = tx.UpdateGuildChannel(c.Request().Context(), sqlc.UpdateGuildChannelParams{
		ParentID:  body.ParentID,
		ChannelID: channelID,
	})

	if err != nil {
		return NewServerError(err, "tx.UpdateChannel")
	}

	updatedChannel := &models.UpdatedGuildChannelParent{
		ID:       channelID,
		GuildID:  guildID,
		ParentID: body.ParentID,
	}

	if body.LockPermissions {
		_, err := tx.UnassignAllRolesFromChannel(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "tx.UnassignAllRolesFromChannel")
		}

		roleIDs, err := tx.AssignParentRolesToChannel(c.Request().Context(), sqlc.AssignParentRolesToChannelParams{
			ChannelID: pgtype.UUID{
				Bytes: channelID,
				Valid: true,
			},
			ParentID: body.ParentID,
		})

		if err != nil {
			return NewServerError(err, "tx.AssignParentRolesToChannel")
		}

		updatedChannel.Roles = roleIDs
	}

	defaultRoleID, err := a.Queries.GetDefaultGuildRole(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "a.Queries.UpdateChannelParentIDAndSyncPermissions")
	}

	dbtx.Commit(c.Request().Context())

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:      "CHANNEL_UPDATE",
		Version: 0,
		RoleIDs: []uuid.UUID{defaultRoleID},
		Data:    updatedChannel,
	})

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleGuildChannelDelete(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	reqCtx := c.Request().Context()
	dbtx, err := a.Pool.Begin(reqCtx)

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer dbtx.Rollback(reqCtx)
	tx := a.Queries.WithTx(dbtx)

	rowsAffected, err := tx.DeleteGuildChannel(c.Request().Context(), sqlc.DeleteGuildChannelParams{
		ChannelID: channelID,
		GuildID:   guildID,
	})

	if err != nil {
		return NewServerError(err, "tx.DeleteChannel")
	}

	if rowsAffected != 1 {
		return NewClientError(nil, http.StatusNotFound, "channel not found")
	}

	if err := tx.DecrementGuildChannelCount(c.Request().Context(), guildID); err != nil {
		return NewServerError(err, "tx.IncrementGuildChannelCount")
	}

	dbtx.Commit(c.Request().Context())

	defaultRoleID, err := a.Queries.GetDefaultGuildRole(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "a.Queries.UpdateChannelParentIDAndSyncPermissions")
	}

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:              "CHANNEL_DELETE",
		Version:         0,
		RoleIDs:         []uuid.UUID{defaultRoleID},
		ExcludedUserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		Data: &models.DeletedChannel{
			ID:      channelID,
			GuildID: guildID,
		},
	})

	return NewSuccessfulResponse(c, http.StatusOK, &models.DeletedChannel{
		ID:      channelID,
		GuildID: guildID,
	})
}
