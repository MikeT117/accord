package rest_api

import (
	"net/http"
	"slices"
	"strconv"

	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleChannelMessageReadMany(c echo.Context) error {

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	params := &sqlc.GetManyChannelMessagesByChannelIDParams{
		ChannelID:    channelID,
		ResultsLimit: 50,
	}

	if len(c.QueryParam("before")) != 0 {

		id, err := uuid.Parse(c.QueryParam("before"))

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
		}

		params.Before = pgtype.UUID{
			Bytes: id,
			Valid: true,
		}
	}

	if len(c.QueryParam("after")) != 0 {
		id, err := uuid.Parse(c.QueryParam("after"))

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
		}

		params.After = pgtype.UUID{
			Bytes: id,
			Valid: true,
		}
	}

	if len(c.QueryParam("limit")) != 0 {
		i, err := strconv.ParseInt(c.QueryParam("limit"), 10, 64)

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid limit")
		}

		if i > 50 {
			return NewClientError(nil, http.StatusBadRequest, "invalid limit")
		}

		params.ResultsLimit = i
	}

	sqlMessages, err := a.Queries.GetManyChannelMessagesByChannelID(c.Request().Context(), *params)

	if err != nil {
		return NewServerError(err, "GetManyGuildChannelMessagesByChannelIDBefore")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetManyChannelMessagesByChannelIDRowsToManyMessage(sqlMessages))
}

func (a *api) HandleChannelPinsReadMany(c echo.Context) error {

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	params := &sqlc.GetManyChannelMessagesByChannelIDParams{
		ChannelID:    channelID,
		ResultsLimit: 50,
		Pinned: pgtype.Bool{
			Bool:  true,
			Valid: true,
		},
	}

	if len(c.QueryParam("before")) != 0 {

		id, err := uuid.Parse(c.QueryParam("before"))

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
		}

		params.Before = pgtype.UUID{
			Bytes: id,
			Valid: true,
		}
	}

	if len(c.QueryParam("after")) != 0 {
		id, err := uuid.Parse(c.QueryParam("after"))

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid timestamp")
		}

		params.After = pgtype.UUID{
			Bytes: id,
			Valid: true,
		}
	}

	if len(c.QueryParam("limit")) != 0 {
		i, err := strconv.ParseInt(c.QueryParam("limit"), 10, 64)

		if err != nil {
			return NewClientError(err, http.StatusBadRequest, "invalid limit")
		}

		if i > 50 {
			return NewClientError(nil, http.StatusBadRequest, "invalid limit")
		}

		params.ResultsLimit = i
	}

	sqlMessages, err := a.Queries.GetManyChannelMessagesByChannelID(c.Request().Context(), *params)

	if err != nil {
		return NewServerError(err, "GetManyGuildChannelMessagesByChannelIDBefore")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetManyChannelMessagesByChannelIDRowsToManyMessage(sqlMessages))
}

func (a *api) HandleChannelMessageCreate(c echo.Context) error {

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	body := ChannelMessageCreateBody{}

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	dbtx, err := a.Pool.Begin(c.Request().Context())

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer dbtx.Rollback(c.Request().Context())
	tx := a.Queries.WithTx(dbtx)

	sqlMessage, err := tx.CreateChannelMessage(c.Request().Context(), sqlc.CreateChannelMessageParams{
		UserID:    c.(*CustomCtx).UserID,
		ChannelID: channelID,
		Content:   body.Content,
	})

	if err != nil {
		return NewServerError(err, "CreateChannelMessage")
	}

	message := a.Mapper.ConvertSQLCCreateChannelMessageRowToMessage(sqlMessage)

	if len(body.Attachments) != 0 {

		count, err := tx.LinkAttachmentsToChannelMessage(c.Request().Context(), sqlc.LinkAttachmentsToChannelMessageParams{
			MessageID:     sqlMessage.ID,
			AttachmentIds: body.Attachments,
		})

		if err != nil {
			return NewServerError(err, "LinkAttachmentsToChannelMessage")
		}

		if count != int64(len(body.Attachments)) {
			return NewServerError(nil, "could not link some/all attachments")
		}

		for i := range body.Attachments {
			message.Attachments = append(message.Attachments, string(body.Attachments[i].String()))
		}

	}

	dbtx.Commit(c.Request().Context())

	forwardedPayload := &message_queue.ForwardedPayload{
		Version: 0,
		Op:      "MESSAGE_CREATE",
		Data:    message,
	}

	if c.(*CustomCtx).IsGuildChannel {

		roleIDs, err := a.Queries.GetRoleIDsByChannelID(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetRoleIDsByChannelID")
		}

		forwardedPayload.RoleIDs = roleIDs
		forwardedPayload.ExcludedUserIDs = []uuid.UUID{c.(*CustomCtx).UserID}

	} else {
		userIDs, err := a.Queries.GetPrivateChannelUserIDs(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetRoleIDsByChannelID")
		}

		forwardedPayload.UserIDs = slices.DeleteFunc[[]uuid.UUID, uuid.UUID](userIDs, func(id uuid.UUID) bool {
			return id == c.(*CustomCtx).UserID
		})
	}

	a.MessageQueue.PublishForwardPayload(forwardedPayload)
	return NewSuccessfulResponse(c, http.StatusCreated, &message)
}

func (a *api) HandleChannelMessageUpdate(c echo.Context) error {

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	messageID, err := uuid.Parse(c.Param("message_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid message ID")
	}

	body := ChannelMessageUpdateBody{}

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	if len(body.Content) == 0 {

		count, err := a.Queries.GetAttachmentCountByMessageID(c.Request().Context(), messageID)

		if err != nil {
			return NewServerError(err, "GetAttachmentCountByMessageID")
		}

		if count < 1 {
			return NewClientError(nil, http.StatusBadRequest, "cannot send an empty message")
		}
	}

	message, err := a.Queries.UpdateChannelMessage(c.Request().Context(), sqlc.UpdateChannelMessageParams{
		ChannelID: channelID,
		MessageID: messageID,
		Content:   body.Content,
	})

	if err != nil {
		return NewServerError(err, "UpdateChannelMessage")
	}

	forwardedPayload := &message_queue.ForwardedPayload{
		Version: 0,
		Op:      "MESSAGE_UPDATE",
		Data:    message,
	}

	if c.(*CustomCtx).IsGuildChannel {

		roleIDs, err := a.Queries.GetRoleIDsByChannelID(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetRoleIDsByChannelID")
		}

		forwardedPayload.RoleIDs = roleIDs
		forwardedPayload.ExcludedUserIDs = []uuid.UUID{c.(*CustomCtx).UserID}

	} else {
		userIDs, err := a.Queries.GetPrivateChannelUserIDs(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetRoleIDsByChannelID")
		}

		forwardedPayload.UserIDs = slices.DeleteFunc[[]uuid.UUID, uuid.UUID](userIDs, func(id uuid.UUID) bool {
			return id == c.(*CustomCtx).UserID
		})
	}

	a.MessageQueue.PublishForwardPayload(forwardedPayload)
	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCUpdateChannelMessageRowUpdatedMessage(message))
}

func (a *api) HandleOwnerChannelMessageDelete(c echo.Context) error {

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	messageID, err := uuid.Parse(c.Param("message_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid message ID")
	}

	sqlDeletedChannelMessage, err := a.Queries.DeleteChannelMessage(c.Request().Context(), sqlc.DeleteChannelMessageParams{
		ChannelID: channelID,
		MessageID: messageID,
		UserID: pgtype.UUID{
			Bytes: c.(*CustomCtx).UserID,
			Valid: true,
		},
	})

	if err != nil {
		return NewServerError(err, "DeleteChannelMessage")
	}

	forwardedPayload := &message_queue.ForwardedPayload{
		Version: 0,
		Op:      "MESSAGE_DELETE",
		Data: &models.DeletedChannelMessage{
			ID:        sqlDeletedChannelMessage.ID,
			ChannelID: sqlDeletedChannelMessage.ChannelID,
		},
	}

	if c.(*CustomCtx).IsGuildChannel {

		roleIDs, err := a.Queries.GetRoleIDsByChannelID(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetRoleIDsByChannelID")
		}

		forwardedPayload.RoleIDs = roleIDs
		forwardedPayload.ExcludedUserIDs = []uuid.UUID{c.(*CustomCtx).UserID}

	} else {
		userIDs, err := a.Queries.GetPrivateChannelUserIDs(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetRoleIDsByChannelID")
		}

		forwardedPayload.UserIDs = slices.DeleteFunc[[]uuid.UUID, uuid.UUID](userIDs, func(id uuid.UUID) bool {
			return id == c.(*CustomCtx).UserID
		})
	}

	a.MessageQueue.PublishForwardPayload(forwardedPayload)
	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleAdminChannelMessageDelete(c echo.Context) error {

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	messageID, err := uuid.Parse(c.Param("message_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid message ID")
	}

	sqlDeletedChannelMessage, err := a.Queries.DeleteChannelMessage(c.Request().Context(), sqlc.DeleteChannelMessageParams{
		ChannelID: channelID,
		MessageID: messageID,
	})

	if err != nil {
		return NewServerError(err, "DeleteChannelMessage")
	}

	forwardedPayload := &message_queue.ForwardedPayload{
		Version: 0,
		Op:      "MESSAGE_DELETE",
		Data: &models.DeletedChannelMessage{
			ID:        sqlDeletedChannelMessage.ID,
			ChannelID: sqlDeletedChannelMessage.ChannelID,
		},
	}

	if c.(*CustomCtx).IsGuildChannel {

		roleIDs, err := a.Queries.GetRoleIDsByChannelID(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetRoleIDsByChannelID")
		}

		forwardedPayload.RoleIDs = roleIDs
		forwardedPayload.ExcludedUserIDs = []uuid.UUID{c.(*CustomCtx).UserID}

	} else {
		userIDs, err := a.Queries.GetPrivateChannelUserIDs(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetRoleIDsByChannelID")
		}

		forwardedPayload.UserIDs = slices.DeleteFunc[[]uuid.UUID, uuid.UUID](userIDs, func(id uuid.UUID) bool {
			return id == c.(*CustomCtx).UserID
		})
	}

	a.MessageQueue.PublishForwardPayload(forwardedPayload)
	return NewSuccessfulResponse(c, http.StatusOK, nil)
}
