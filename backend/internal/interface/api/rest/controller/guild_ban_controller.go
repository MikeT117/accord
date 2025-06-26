package controller

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/interface/api/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"

	"github.com/labstack/echo/v4"
)

type GuildBanController struct {
	guildBanService interfaces.GuildBanService
}

func NewGuildBanController(
	baseGroup *echo.Group,
	guildBanService interfaces.GuildBanService,
) *GuildBanController {
	controller := &GuildBanController{
		guildBanService: guildBanService,
	}

	subGroup := baseGroup.Group("/guilds/:guildID/bans")
	subGroup.PUT("/:userID", controller.createGuildBan)
	subGroup.DELETE("/:userID", controller.deleteGuildBan)
	return controller
}

func (c *GuildBanController) createGuildBan(ctx echo.Context) error {
	var payload request.CreateGuildBanRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToCreateGuildBanCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildBanService.Create(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildBanController) deleteGuildBan(ctx echo.Context) error {
	var payload request.DeleteGuildBanRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteGuildBanCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildBanService.Delete(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
