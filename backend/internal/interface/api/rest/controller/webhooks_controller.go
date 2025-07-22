package controller

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"

	"github.com/labstack/echo/v4"
)

type WebhooksController struct {
	config            *config.Config
	attachmentService interfaces.AttachmentService
}

func NewWebhooksController(
	config *config.Config,
	baseGroup *echo.Group,
	attachmentService interfaces.AttachmentService,
) *WebhooksController {
	controller := &WebhooksController{
		config:            config,
		attachmentService: attachmentService,
	}

	subGroup := baseGroup.Group("/attachments")
	subGroup.POST("/notification", controller.cloudinaryUploadNotification)

	return controller
}

func (c *WebhooksController) cloudinaryUploadNotification(ctx echo.Context) error {

	timestampHeader := ctx.Request().Header.Get("X-Cld-Timestamp")
	if strings.Trim(timestampHeader, " ") == "" {
		log.Println("X-Cld-Timestamp missing")
		return response.ErrorResponse(ctx, 400, nil)
	}

	signatureHeader := ctx.Request().Header.Get("X-Cld-Signature")
	if strings.Trim(signatureHeader, " ") == "" {
		log.Println("X-Cld-Signature missing")
		return response.ErrorResponse(ctx, 400, nil)
	}

	body := ctx.Request().Body
	defer body.Close()

	data, err := io.ReadAll(body)
	if err != nil {
		log.Println(err)

		if !errors.Is(err, io.EOF) {
			return response.NoContentResponse(ctx)
		}
	}

	hash := sha1.New()
	hash.Write([]byte(fmt.Sprint(string(data), timestampHeader, c.config.CloudinarySecret)))

	if hex.EncodeToString(hash.Sum(nil)) != signatureHeader {
		log.Println("signature mismatch")
		return response.ErrorResponse(ctx, 400, nil)
	}

	var cloudinaryNotification request.CloudinaryNotification
	if err := json.Unmarshal(data, &cloudinaryNotification); err != nil {
		log.Println("unmarshal err", err)
		return response.ErrorResponse(ctx, 400, nil)
	}

	height := int64(cloudinaryNotification.Height)
	width := int64(cloudinaryNotification.Width)

	if err := c.attachmentService.Update(ctx.Request().Context(), &command.UpdateAttachmentCommand{
		ID:     cloudinaryNotification.PublicID,
		Status: 1,
		Height: &height,
		Width:  &width,
	}); err != nil {
		log.Println("db update err", err)
		return response.ErrorResponse(ctx, 400, nil)
	}

	return response.NoContentResponse(ctx)
}
