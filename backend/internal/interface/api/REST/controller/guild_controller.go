package controller

import (
	"fmt"
	"net/http"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/mapper"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/response"

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

	subGroup := baseGroup.Group("/guild")
	subGroup.POST("", controller.CreateGuild)
	subGroup.GET("", controller.GetGuild)
	subGroup.PATCH("/:guildID", controller.UpdateGuild)
	subGroup.DELETE("/:guildID", controller.DeleteGuild)
	return controller
}

func (c *GuildController) GetGuild(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)
	guilds, err := c.guildService.GetByUserID(ctx.Request().Context(), requestorID)
	if err != nil {
		fmt.Println(err)
		return response.ErrorResponse(ctx, http.StatusInternalServerError, nil)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToGuildsResponse(guilds.Result))

}

func (c *GuildController) CreateGuild(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)

	var payload request.CreateGuildRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	if err := c.guildService.Create(
		ctx.Request().Context(),
		payload.ToCreateGuildCommand(requestorID),
	); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildController) UpdateGuild(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)

	var payload request.UpdateGuildRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	if err := c.guildService.Update(
		ctx.Request().Context(),
		payload.ToUpdateGuildCommand(ctx.Param("guildID")),
		requestorID,
	); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildController) DeleteGuild(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)

	if err := c.guildService.Delete(
		ctx.Request().Context(),
		ctx.Param("guildID"),
		requestorID,
	); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
