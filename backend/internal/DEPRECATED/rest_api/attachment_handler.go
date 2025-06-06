package rest_api

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleAttachmentSign(c echo.Context) error {

	var body AttachmentSignBody

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	cctx := c.(*CustomCtx)

	createAttachmentParams := sqlc.CreateAttachmentParams{
		ID:            uuid.New(),
		ResourceType:  body.ResourceType,
		AttachedByID:  cctx.UserID,
		UnixTimestamp: time.Now().Unix(),
		Height:        int32(body.Height),
		Width:         int32(body.Width),
		Filesize:      int32(body.Filesize),
	}

	hash := sha1.New()
	hash.Write([]byte(fmt.Sprintf("public_id=%s&timestamp=%d%s", createAttachmentParams.ID, createAttachmentParams.UnixTimestamp, os.Getenv("CLOUDINARY_SECRET"))))

	createAttachmentParams.Signature = hex.EncodeToString(hash.Sum(nil))

	rowsAffected, err := a.Queries.CreateAttachment(c.Request().Context(), createAttachmentParams)

	if err != nil {
		return NewServerError(err, "a.Queries.CreateAttachment")
	}

	if rowsAffected != 1 {
		return NewServerError(nil, "a.Queries.CreateAttachment")
	}

	return NewSuccessfulResponse(c, http.StatusOK, &models.SignedAttachment{
		ID:        createAttachmentParams.ID,
		UploadURL: fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/auto/upload?api_key=%s&signature=%s&timestamp=%d&public_id=%s", os.Getenv("CLOUDINARY_ENVIRONMENT"), os.Getenv("CLOUDINARY_API_KEY"), createAttachmentParams.Signature, createAttachmentParams.UnixTimestamp, createAttachmentParams.ID),
	})
}

func (a *api) HandleAttachmentDelete(c echo.Context) error {

	attachmentID, err := uuid.Parse(c.Param("attachment_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid attachment ID")
	}

	ctxReq := c.Request().Context()

	sqlAttachment, err := a.Queries.GetAttachmentByID(ctxReq, attachmentID)

	if err != nil {
		if database.IsPGErrNoRows(err) {
			return NewClientError(err, http.StatusNotFound, "attachment not found")
		}
		return NewServerError(err, "a.Queries.GetAttachmentByID")
	}

	response, err := http.Post(fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/destroy?api_key=%s&signature=%s&timestamp=%d&public_id=%s", os.Getenv("CLOUDINARY_ENVIRONMENT"), os.Getenv("CLOUDINARY_API_KEY"), sqlAttachment.Signature, sqlAttachment.UnixTimestamp, sqlAttachment.ID), "application/json", nil)

	if err != nil {
		return NewServerError(err, "destroy request failed")
	}

	if response.StatusCode != 200 {
		return NewServerError(nil, "unable to delete file")
	}

	cctx := c.(*CustomCtx)

	rowsAffected, err := a.Queries.DeleteAttachment(c.Request().Context(), sqlc.DeleteAttachmentParams{
		AttachmentID: attachmentID,
		UserID:       cctx.UserID,
	})

	if err != nil {
		return NewServerError(nil, "a.Queries.DeleteAttachment")
	}

	if rowsAffected != 1 {
		return NewClientError(nil, http.StatusBadRequest, "attachment not found")
	}

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}
