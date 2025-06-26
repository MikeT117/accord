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

type GuildController struct {
	guildService interfaces.GuildService
}

func NewGuildController(
	baseGroup *echo.Group,
	guildService interfaces.GuildService,
) *GuildController {
	controller := &GuildController{
		guildService: guildService,
	}

	subGroup := baseGroup.Group("/guilds")
	subGroup.POST("", controller.createGuild)
	subGroup.GET("", controller.getGuilds)
	subGroup.PATCH("/:guildID", controller.updateGuild)
	subGroup.DELETE("/:guildID", controller.deleteGuild)
	return controller
}

func (c *GuildController) getGuilds(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)
	guilds, err := c.guildService.GetByUserID(ctx.Request().Context(), requestorID)
	if err != nil {
		handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToGuildsResponse(guilds.Result))

}

func (c *GuildController) createGuild(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)

	var payload request.CreateGuildRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildService.Create(
		ctx.Request().Context(),
		payload.ToCreateGuildCommand(requestorID),
	); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildController) updateGuild(ctx echo.Context) error {

	var payload request.UpdateGuildRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToUpdateGuildCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildService.Update(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildController) deleteGuild(ctx echo.Context) error {

	var payload request.DeleteGuildRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteGuildCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildService.Delete(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
