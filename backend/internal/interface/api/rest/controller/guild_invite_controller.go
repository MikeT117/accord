package controller

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/interface/api/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/mapper"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"

	"github.com/labstack/echo/v4"
)

type GuildInviteController struct {
	guildInviteService interfaces.GuildInviteService
}

func NewGuildInviteController(
	baseGroup *echo.Group,
	guildInviteService interfaces.GuildInviteService,
) *GuildInviteController {
	controller := &GuildInviteController{
		guildInviteService: guildInviteService,
	}

	baseGroup.GET("/invite/:inviteID", controller.getPublicInvite)

	subGroup := baseGroup.Group("/guilds/:guildID/invites")
	subGroup.GET("", controller.getInvites)
	subGroup.POST("", controller.createInvite)
	subGroup.DELETE("/:inviteID", controller.deleteInvite)

	return controller
}

func (c *GuildInviteController) getPublicInvite(ctx echo.Context) error {
	var payload request.QueryPublicInviteRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	qry, err := payload.ToPublicInviteQuery(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	publicInvite, err := c.guildInviteService.GetPublicByID(ctx.Request().Context(), qry)
	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToPublicInviteResponse(publicInvite.Result))
}

func (c *GuildInviteController) getInvites(ctx echo.Context) error {
	var payload request.QueryGuildInvitesRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	qry, err := payload.ToGuildInvitesQuery(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	guildInvites, err := c.guildInviteService.GetByGuildID(ctx.Request().Context(), qry)
	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToGuildInvitesResponse(guildInvites.Result))
}

func (c *GuildInviteController) createInvite(ctx echo.Context) error {
	var payload request.CreateGuildInviteRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToCreateGuildInviteCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	guildInvite, err := c.guildInviteService.Create(ctx.Request().Context(), cmd)

	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToGuildInviteResponse(guildInvite.Result))
}

func (c *GuildInviteController) deleteInvite(ctx echo.Context) error {
	var payload request.DeleteGuildInviteRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteGuildInviteCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildInviteService.Delete(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
