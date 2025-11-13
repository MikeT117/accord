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
	subGroup.POST("", controller.createChannel)
	subGroup.PATCH("/:channelID", controller.updateChannel)
	subGroup.DELETE("/:channelID", controller.deleteChannel)

	subGroup.DELETE("/:channelID/users/:userID", controller.associateChannelUser)
	subGroup.PUT("/:channelID/users/:userID", controller.disassociateChannelUser)
	return controller
}

func (c *ChannelController) createChannel(ctx echo.Context) error {
	var payload request.CreateChannelRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToCreateChannelCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	channel, err := c.channelService.Create(ctx.Request().Context(), cmd)
	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToChannelResponse(channel.Result))
}

func (c *ChannelController) updateChannel(ctx echo.Context) error {
	var payload request.UpdateChannelRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToUpdateChannelCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.channelService.Update(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *ChannelController) deleteChannel(ctx echo.Context) error {
	var payload request.DeleteChannelRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)

	cmd, err := payload.ToDeleteChannelCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.channelService.Delete(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *ChannelController) associateChannelUser(ctx echo.Context) error {
	var payload request.CreateUserChannelAssoc
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToCreateUserChannelAssociationCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.channelService.CreateUserAssoc(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *ChannelController) disassociateChannelUser(ctx echo.Context) error {
	var payload request.DeleteUserChannelAssoc
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteUserChannelAssociationCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.channelService.DeleteUserAssoc(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
