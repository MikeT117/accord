package controller

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/response"

	"github.com/labstack/echo/v4"
)

type ChannelController struct {
	channelService interfaces.ChannelService
}

func NewChannelController(
	baseGroup *echo.Group,
	channelService interfaces.ChannelService,
) *ChannelController {
	controller := &ChannelController{
		channelService: channelService,
	}

	subGroup := baseGroup.Group("/channels")
	subGroup.POST("", controller.CreateChannel)
	subGroup.PATCH("/:channelID", controller.UpdateChannel)
	subGroup.DELETE("/:channelID", controller.DeleteChannel)

	subGroup.DELETE("/:channelID/users/:userID", controller.DeleteChannelUser)
	subGroup.PUT("/:channelID/users/:userID", controller.CreateChannelUser)
	return controller
}

func (c *ChannelController) CreateChannel(ctx echo.Context) error {
	var payload request.CreateChannelRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)

	if err := c.channelService.Create(
		ctx.Request().Context(),
		payload.ToCreateChannelCommand(requestorID),
		requestorID,
	); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *ChannelController) UpdateChannel(ctx echo.Context) error {
	var payload request.UpdateChannelRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)

	if err := c.channelService.Update(
		ctx.Request().Context(),
		payload.ToUpdateChannelCommand(ctx.Param("channelID")),
		requestorID,
	); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *ChannelController) DeleteChannel(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)

	if err := c.channelService.Delete(
		ctx.Request().Context(),
		ctx.Param("channelID"),
		requestorID,
	); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *ChannelController) CreateChannelUser(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)
	if err := c.channelService.DisassociateUser(
		ctx.Request().Context(),
		ctx.Param("channelID"),
		ctx.Param("userID"),
		requestorID,
	); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *ChannelController) DeleteChannelUser(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)
	if err := c.channelService.DisassociateUser(
		ctx.Request().Context(),
		ctx.Param("channelID"),
		ctx.Param("userID"),
		requestorID,
	); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
