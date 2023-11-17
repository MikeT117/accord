package rest_api

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

// TODO: Fire GUILD_CHANNEL_CREATE/CHANNEL_CREATE event - all properties are included
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
		CreatorID:   c.(*APIContext).UserID,
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

		guildChannel.Roles = append(guildChannel.Roles, guildChannel.Roles...)

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

	if err != nil {
		return NewServerError(err, "tx.AssignDefaultRoleToGuildChannels")
	}

	guildChannel.Roles = append(guildChannel.Roles, sqlOwnerGuildRoleID)

	dbtx.Commit(reqCtx)

	return NewSuccessfulResponse(c, http.StatusOK, &guildChannel)
}

// TODO: Fire GUILD_CHANNEL_ROLE_UPDATE/CHANNEL_ROLE_UPDATE event - GuildID, ChannelID and Roles included
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
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid member ID")
	}

	_, err = a.Queries.UpdateChannelParentID(c.Request().Context(), sqlc.UpdateChannelParentIDParams{
		ChannelID: channelID,
		ParentID:  body.ParentID,
		GuildID:   guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.UpdateChannelParentID")
	}

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

// TODO: Fire CHANNEL_DELETE event - all properties are included
func (a *api) HandleGuildChannelDelete(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid guild ID")
	}

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	rowsAffected, err := a.Queries.DeleteGuildChannel(c.Request().Context(), sqlc.DeleteGuildChannelParams{
		ChannelID: channelID,
		GuildID:   guildID,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.DeleteChannel")
	}

	if rowsAffected != 1 {
		return NewClientError(nil, http.StatusNotFound, "channel not found")
	}

	// TODO: Fire CHANNEL_DELETE event

	return NewSuccessfulResponse(c, http.StatusOK, &models.DeletedChannel{
		ID:      channelID,
		GuildID: guildID,
	})
}
