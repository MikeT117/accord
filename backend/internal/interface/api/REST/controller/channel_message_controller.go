package controller

import (
	"net/http"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/mapper"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/response"

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

	subGroup := baseGroup.Group("/channels")
	subGroup.GET("/:channelID/messages", controller.getChannelMessages)
	subGroup.POST("/:channelID/messages", controller.createChannelMessage)
	// subGroup.PATCH("/:channelID/:messageID", controller.updateChannelMessage)
	// subGroup.DELETE("/:channelID/:messageID", controller.deleteChannelMessage)

	return controller
}

func (c *ChannelMessageController) getChannelMessages(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)
	channelMessages, err := c.channelMessageService.GetByChannelID(ctx.Request().Context(), ctx.Param("channelID"), ctx.Param("pinned") == "true", time.Now().UTC(), requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToChannelMessagesResponse(channelMessages.Result))
}

func (c *ChannelMessageController) createChannelMessage(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)

	var payload request.CreateChannelMessageRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	cmd, err := payload.ToCreateChannelMessageCommand(requestorID, ctx.Param("channelID"))
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.channelMessageService.Create(ctx.Request().Context(), cmd, requestorID); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

// func (c *ChannelMessageController) updateChannelMessage(ctx echo.Context) error {}
// func (c *ChannelMessageController) deleteChannelMessage(ctx echo.Context) error {}
