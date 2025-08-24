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

type ChannelMessageController struct {
	channelMessageService interfaces.ChannelMessageService
}

func NewChannelMessageController(
	baseGroup *echo.Group,
	channelMessageService interfaces.ChannelMessageService,
) *ChannelMessageController {
	controller := &ChannelMessageController{
		channelMessageService: channelMessageService,
	}

	subGroup0 := baseGroup.Group("/channels/:channelID")
	subGroup0.PUT("/pins/messages/:messageID", controller.pinChannelMessage)
	subGroup0.DELETE("/pins/messages/:messageID", controller.unpinChannelMessage)

	subGroup1 := baseGroup.Group("/channels/:channelID/messages")
	subGroup1.GET("", controller.getChannelMessages)
	subGroup1.POST("", controller.createChannelMessage)
	subGroup1.PATCH("/:messageID", controller.updateChannelMessage)
	subGroup1.DELETE("/:messageID", controller.deleteChannelMessage)
	return controller
}

func (c *ChannelMessageController) getChannelMessages(ctx echo.Context) error {
	var payload request.QueryChannelMessagesRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	qry, err := payload.ToChannelMessagesQuery(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	channelMessages, err := c.channelMessageService.GetByChannelID(ctx.Request().Context(), qry)
	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToChannelMessagesResponse(channelMessages.Result))
}

func (c *ChannelMessageController) pinChannelMessage(ctx echo.Context) error {
	var payload request.CreateChannelPinRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToCreateChannelPinCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.channelMessageService.PinMessage(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *ChannelMessageController) unpinChannelMessage(ctx echo.Context) error {
	var payload request.DeleteChannelPinRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteChannelPinCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.channelMessageService.UnpinMessage(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *ChannelMessageController) createChannelMessage(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)

	var payload request.CreateChannelMessageRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	cmd, err := payload.ToCreateChannelMessageCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.channelMessageService.Create(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *ChannelMessageController) updateChannelMessage(ctx echo.Context) error {
	var payload request.UpdateChannelMessageRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToUpdateChannelMessageCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.channelMessageService.Update(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *ChannelMessageController) deleteChannelMessage(ctx echo.Context) error {
	var payload request.DeleteChannelMessageRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteChannelMessageCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.channelMessageService.Delete(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
