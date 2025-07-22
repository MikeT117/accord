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

type AttachmentController struct {
	attachmentService interfaces.AttachmentService
}

func NewAttachmentController(
	baseGroup *echo.Group,
	attachmentService interfaces.AttachmentService,
) *AttachmentController {
	controller := &AttachmentController{
		attachmentService: attachmentService,
	}

	subGroup := baseGroup.Group("/attachments")
	subGroup.POST("", controller.createAttachment)
	subGroup.DELETE("/:attachmentID", controller.deleteAttachment)

	return controller
}

func (c *AttachmentController) createAttachment(ctx echo.Context) error {
	var payload request.CreateAttachmentRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToCreateAttachmentCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	attachmentSignResult, err := c.attachmentService.Create(ctx.Request().Context(), cmd)
	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToAttachmentSignResponse(attachmentSignResult.Result))
}

func (c *AttachmentController) deleteAttachment(ctx echo.Context) error {
	var payload request.DeleteAttachmentRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteAttachmentCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.attachmentService.Delete(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
