package controller

import (
	"fmt"
	"net/http"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/interface/api/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/mapper"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"

	"github.com/labstack/echo/v4"
)

type GuildRoleController struct {
	guildRoleService interfaces.GuildRoleService
}

func NewGuildRoleController(
	baseGroup *echo.Group,
	guildRoleService interfaces.GuildRoleService,
) *GuildRoleController {
	controller := &GuildRoleController{
		guildRoleService: guildRoleService,
	}

	subGroup := baseGroup.Group("/guilds/:guildID/roles")
	subGroup.GET("/:roleID/members", controller.getGuildRoleMembers)

	subGroup.POST("", controller.createGuildRole)
	subGroup.PATCH("/:roleID", controller.updateGuildRole)
	subGroup.DELETE("/:roleID", controller.deleteGuildRole)

	subGroup.PATCH("/:roleID/users", controller.createUserRoleAssociation)
	subGroup.DELETE("/:roleID/users/:userID", controller.deleteUserRoleAssociation)

	subGroup.PUT("/:roleID/channels/:channelID", controller.createChannelRoleAssociation)
	subGroup.DELETE("/:roleID/channels/:channelID", controller.deleteChannelRoleAssociation)

	subGroup.POST("/sync/:sourceChannelID/:targetChannelID", controller.syncChannelRoleAssociations)

	return controller
}

func (c *GuildRoleController) getGuildRoleMembers(ctx echo.Context) error {
	var payload request.QueryGuildRoleMembersRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	qry, err := payload.ToGuildRoleMembersQuery(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	var guildRoleMembers *query.GuildMemberQueryListResult
	if payload.Assigned == nil || *payload.Assigned {
		guildRoleMembers, err = c.guildRoleService.GetAssignedGuildMembersByRoleID(ctx.Request().Context(), qry)
	} else {
		guildRoleMembers, err = c.guildRoleService.GetUnassignedGuildMembersByRoleID(ctx.Request().Context(), qry)
	}

	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToGuildMembersResponse(guildRoleMembers.Result))
}

func (c *GuildRoleController) syncChannelRoleAssociations(ctx echo.Context) error {
	var payload request.SyncChannelRoleAssociationsRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToSyncGuildRoleChannelAssociationsCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildRoleService.SyncGuildChannelRoleAssociations(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildRoleController) createUserRoleAssociation(ctx echo.Context) error {
	var payload request.CreateGuildRoleUserAssocRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToCreateGuildRoleUserAssociationCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildRoleService.CreateUserAssoc(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}
	return response.NoContentResponse(ctx)
}

func (c *GuildRoleController) createChannelRoleAssociation(ctx echo.Context) error {
	var payload request.CreateGuildRoleChannelAssocRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToCreateGuildRoleChannelAssociationCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildRoleService.CreateChannelAssoc(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildRoleController) deleteUserRoleAssociation(ctx echo.Context) error {
	var payload request.DeleteGuildRoleUserAssocRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteGuildRoleUserAssociationCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildRoleService.DeleteUserAssoc(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildRoleController) deleteChannelRoleAssociation(ctx echo.Context) error {
	var payload request.DeleteGuildRoleChannelAssocRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteGuildRoleChannelAssociationCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildRoleService.DeleteChannelAssoc(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildRoleController) createGuildRole(ctx echo.Context) error {
	var payload request.CreateGuildRoleRequest
	if err := ctx.Bind(&payload); err != nil {
		fmt.Printf("Error type: %T\n", err)
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToCreateGuildRoleCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildRoleService.Create(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildRoleController) updateGuildRole(ctx echo.Context) error {

	var payload request.UpdateGuildRoleRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToUpdateGuildRoleCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildRoleService.Update(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildRoleController) deleteGuildRole(ctx echo.Context) error {
	var payload request.DeleteGuildRoleRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteGuildRoleCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildRoleService.Delete(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
