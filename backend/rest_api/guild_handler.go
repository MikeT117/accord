package rest_api

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleGuildReadMany(c echo.Context) error {
	params := &sqlc.GetManyDiscoverableGuildsParams{}

	if len(c.QueryParam("before")) != 0 {
		id, err := uuid.Parse(c.QueryParam("before"))

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid id")
		}

		params.Before = pgtype.UUID{
			Bytes: id,
			Valid: true,
		}
	}

	if len(c.QueryParam("after")) != 0 {
		id, err := uuid.Parse(c.QueryParam("before"))

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid id")
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

	if len(c.QueryParam("name")) != 0 {
		params.Name = pgtype.Text{
			String: fmt.Sprintf("%s%s%s", "%", strings.ReplaceAll(c.QueryParam("name"), "+", " "), "%"),
			Valid:  true,
		}
	}

	if len(c.QueryParam("category_id")) != 0 {
		id, err := uuid.Parse(c.QueryParam("category_id"))

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid category_id")
		}

		params.CategoryID = pgtype.UUID{
			Bytes: id,
			Valid: true,
		}
	}

	sqlGuilds, err := a.Queries.GetManyDiscoverableGuilds(c.Request().Context(), *params)

	if err != nil {
		return NewServerError(err, "a.Queries.GetDiscoverableGuilds")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertGetManyDiscoverableGuildsRowToDiscoverableGuilds(sqlGuilds))
}

func (a *api) HandleGuildCreate(c echo.Context) error {
	var body GuildCreateRequestBody

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	cctx := c.(*CustomCtx)
	reqCtx := c.Request().Context()

	dbTx, err := a.Pool.Begin(reqCtx)

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer dbTx.Rollback(reqCtx)
	tx := a.Queries.WithTx(dbTx)

	sqlGuild, err := tx.CreateGuild(reqCtx, sqlc.CreateGuildParams{
		Name:            body.Name,
		IsDiscoverable:  body.IsDiscoverable,
		GuildCategoryID: body.GuildCategoryID,
		CreatorID:       cctx.UserID,
	})

	if err != nil {
		return NewServerError(err, "tx.CreateGuild")
	}

	if body.Icon != nil {
		rowsAffected, err := tx.LinkAttachmentToGuild(reqCtx, sqlc.LinkAttachmentToGuildParams{
			GuildID:      sqlGuild.ID,
			UsageType:    0,
			AttachmentID: *body.Icon,
		})

		if err != nil {
			return NewServerError(err, "tx.LinkAttachmentToGuild")
		}

		if rowsAffected != 1 {
			return NewServerError(nil, "tx.LinkAttachmentToGuild")
		}
	}

	sqlGuildOwner, err := tx.CreateGuildMember(reqCtx, sqlc.CreateGuildMemberParams{
		GuildID: sqlGuild.ID,
		UserID:  cctx.UserID,
	})

	if err != nil {
		return NewServerError(err, "tx.CreateGuildMember")
	}

	sqlDefaultRole, err := tx.CreatGuildRole(reqCtx, sqlc.CreatGuildRoleParams{
		Name:        "@default",
		CreatorID:   sqlGuildOwner.UserID,
		GuildID:     sqlGuild.ID,
		Permissions: 1,
	})

	if err != nil {
		return NewServerError(err, "tx.CreatGuildRole")
	}

	sqlOwnerRole, err := tx.CreatGuildRole(reqCtx, sqlc.CreatGuildRoleParams{
		Name:        "@owner",
		CreatorID:   sqlGuildOwner.UserID,
		GuildID:     sqlGuild.ID,
		Permissions: 2147483647,
	})

	if err != nil {
		return NewServerError(err, "tx.CreatGuildRole")
	}

	rowsAffected, err := tx.AssignManyRolesToUser(reqCtx, sqlc.AssignManyRolesToUserParams{
		RoleIds: []uuid.UUID{sqlOwnerRole.ID, sqlDefaultRole.ID},
		UserID:  sqlGuildOwner.UserID,
		GuildID: sqlGuild.ID,
	})

	if err != nil {
		return NewServerError(err, "tx.AssignRoleToGuildMember")
	}

	if rowsAffected != 2 {
		return NewClientError(nil, http.StatusNotFound, "Row/Member not found")
	}

	if err := dbTx.Commit(reqCtx); err != nil {
		return NewServerError(err, "dbTx.Commit")
	}

	sqlUser, err := a.Queries.GetUserByID(reqCtx, cctx.UserID)

	if err != nil {
		return NewServerError(err, "a.Queries.GetUserById")
	}

	guildMember := a.Mapper.ConvertSQLCGuildMemberToGuildMember(sqlGuildOwner)
	guildMember.Roles = []uuid.UUID{sqlOwnerRole.ID, sqlDefaultRole.ID}
	guild := a.Mapper.ConvertSQLCGuildToGuild(sqlGuild)
	guildMember.User = a.Mapper.ConvertGetUserByIDRowToUser(sqlUser)
	guild.Member = guildMember
	guild.Channels = []models.GuildChannel{}
	guild.Roles = a.Mapper.ConvertSQLCGuildRoleToGuildRoles([]sqlc.GuildRole{sqlOwnerRole, sqlDefaultRole})

	if body.Icon != nil {
		guild.Icon = body.Icon
	}

	return NewSuccessfulResponse(c, http.StatusCreated, &guild)
}

func (a *api) HandleGuildUpdate(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid guild ID")
	}

	var body GuildUpdateRequestBody

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	reqCtx := c.Request().Context()
	dbTx, err := a.Pool.Begin(reqCtx)

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer dbTx.Rollback(reqCtx)
	tx := a.Queries.WithTx(dbTx)

	sqlUpdatedGuild, err := tx.UpdateGuild(reqCtx, sqlc.UpdateGuildParams{
		Name:            body.Name,
		Description:     body.Description,
		IsDiscoverable:  body.IsDiscoverable,
		GuildCategoryID: body.CategoryID,
		GuildID:         guildID,
	})

	if err != nil {
		return NewServerError(err, "tx.UpdateGuild")
	}

	updatedGuild := a.Mapper.ConvertSQLUpdateGuildRowToUpdatedGuild(sqlUpdatedGuild)

	if body.Icon != nil {
		rowsAffected, err := tx.LinkAttachmentToGuild(reqCtx, sqlc.LinkAttachmentToGuildParams{
			GuildID:      sqlUpdatedGuild.ID,
			UsageType:    0,
			AttachmentID: *body.Icon,
		})

		if err != nil {
			return NewServerError(err, "tx.LinkAttachmentToGuild")
		}

		if rowsAffected != 1 {
			return NewServerError(nil, "tx.LinkAttachmentToGuild")
		}

		updatedGuild.Icon = body.Icon
	}

	if body.Banner != nil {
		rowsAffected, err := tx.LinkAttachmentToGuild(reqCtx, sqlc.LinkAttachmentToGuildParams{
			GuildID:      sqlUpdatedGuild.ID,
			UsageType:    1,
			AttachmentID: *body.Banner,
		})

		if err != nil {
			return NewServerError(err, "tx.LinkAttachmentToGuild")
		}

		if rowsAffected != 1 {
			return NewServerError(nil, "tx.LinkAttachmentToGuild")
		}

		updatedGuild.Banner = body.Banner
	}

	dbTx.Commit(reqCtx)

	sqlDefaultRoleId, err := a.Queries.GetDefaultGuildRole(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "a.Queries.GetDefaultGuildRole")
	}

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:              "GUILD_UPDATE",
		Version:         0,
		RoleIDs:         []uuid.UUID{sqlDefaultRoleId},
		ExcludedUserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		Data:            &updatedGuild,
	})

	return NewSuccessfulResponse(c, http.StatusOK, &updatedGuild)
}

func (a *api) HandleGuildDelete(c echo.Context) error {
	guildID, err := uuid.Parse(c.Param("guild_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "Invalid guild ID")
	}

	sqlDefaultRoleId, err := a.Queries.GetDefaultGuildRole(c.Request().Context(), guildID)

	if err != nil {
		return NewServerError(err, "a.Queries.GetDefaultGuildRole")
	}

	if err := a.Queries.DeleteGuild(c.Request().Context(), guildID); err != nil {
		return NewServerError(err, "a.Queries.DeleteGuild")
	}

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:              "GUILD_DELETE",
		Version:         0,
		RoleIDs:         []uuid.UUID{sqlDefaultRoleId},
		ExcludedUserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		Data: &models.DeletedGuild{
			ID: guildID,
		},
	})

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}
