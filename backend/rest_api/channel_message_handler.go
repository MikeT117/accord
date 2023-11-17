package rest_api

import (
	"net/http"
	"strconv"

	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
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

// TODO: Fire MESSAGE_CREATE event - all properties are included
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
		UserID:    c.(*APIContext).UserID,
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

	roleIDs, err := a.Queries.GetRoleIDsByChannelID(c.Request().Context(), channelID)

	if err != nil {
		return NewServerError(err, "GetRoleIDsByChannelID")
	}

	dbtx.Commit(c.Request().Context())

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Version: 0,
		Op:      "MESSAGE_CREATE",
		RoleIDs: roleIDs,
		UserIDs: []string{c.(*APIContext).UserID.String()},
		Data:    message,
	})

	return NewSuccessfulResponse(c, http.StatusCreated, &message)
}

// TODO: Fire MESSAGE_UPDATE event - with only the updated properties of the message
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

	// TODO: Check if the message has any attachments, if not return an error, as the message should be deleted rather than edited to an empty state
	if len(body.Content) == 0 {
		return NewClientError(nil, http.StatusBadRequest, "cannot send an empty message")
	}

	message, err := a.Queries.UpdateChannelMessage(c.Request().Context(), sqlc.UpdateChannelMessageParams{
		ChannelID: channelID,
		MessageID: messageID,
		Content:   body.Content,
	})

	if err != nil {
		return NewServerError(err, "UpdateChannelMessage")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCUpdateChannelMessageRowUpdatedMessage(message))
}

// TODO: Fire MESSAGE_DELETE event with message info
func (a *api) HandleOwnerChannelMessageDelete(c echo.Context) error {

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	messageID, err := uuid.Parse(c.Param("message_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid message ID")
	}

	_, err = a.Queries.DeleteChannelMessage(c.Request().Context(), sqlc.DeleteChannelMessageParams{
		ChannelID: channelID,
		MessageID: messageID,
		UserID: pgtype.UUID{
			Bytes: c.(*APIContext).UserID,
			Valid: true,
		},
	})

	if err != nil {
		return NewServerError(err, "DeleteChannelMessage")
	}

	return NewSuccessfulResponse(c, http.StatusNoContent, nil)
}

// TODO: Fire MESSAGE_DELETE event with message info
func (a *api) HandleAdminChannelMessageDelete(c echo.Context) error {

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	messageID, err := uuid.Parse(c.Param("message_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid message ID")
	}

	_, err = a.Queries.DeleteChannelMessage(c.Request().Context(), sqlc.DeleteChannelMessageParams{
		ChannelID: channelID,
		MessageID: messageID,
	})

	if err != nil {
		return NewServerError(err, "DeleteChannelMessage")
	}

	return NewSuccessfulResponse(c, http.StatusNoContent, nil)
}
