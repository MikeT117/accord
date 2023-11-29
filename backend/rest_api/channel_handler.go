package rest_api

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleChannelMessagePinCreate(c echo.Context) error {

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	messageID, err := uuid.Parse(c.Param("message_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid message ID")
	}

	rowsAffected, err := a.Queries.PinChannelMessage(c.Request().Context(), sqlc.PinChannelMessageParams{
		ChannelID: channelID,
		MessageID: messageID,
	})

	if err != nil {
		return NewServerError(err, "PinChannelMessage")
	}

	if rowsAffected != 1 {
		return NewClientError(nil, http.StatusNotFound, "message not found")
	}

	roleIDs, err := a.Queries.GetRoleIDsByChannelID(c.Request().Context(), channelID)

	if err != nil {
		return NewServerError(err, "GetRoleIDsByChannelID")
	}

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Version:         0,
		Op:              "CHANNEL_PINS_UPDATE",
		RoleIDs:         roleIDs,
		ExcludedUserIDs: []uuid.UUID{c.(*APIContext).UserID},
		Data:            nil,
	})

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleChannelMessagePinDelete(c echo.Context) error {

	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	messageID, err := uuid.Parse(c.Param("message_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid message ID")
	}

	rowsAffected, err := a.Queries.UnpinChannelMessage(c.Request().Context(), sqlc.UnpinChannelMessageParams{
		ChannelID: channelID,
		MessageID: messageID,
	})

	if err != nil {
		return NewServerError(err, "UnpinChannelMessage")
	}

	if rowsAffected != 1 {
		return NewClientError(nil, http.StatusNotFound, "message not found")
	}

	roleIDs, err := a.Queries.GetRoleIDsByChannelID(c.Request().Context(), channelID)

	if err != nil {
		return NewServerError(err, "GetRoleIDsByChannelID")
	}

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Version:         0,
		Op:              "CHANNEL_PINS_UPDATE",
		RoleIDs:         roleIDs,
		ExcludedUserIDs: []uuid.UUID{c.(*APIContext).UserID},
		Data:            nil,
	})

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleChannelUpdate(c echo.Context) error {
	channelID, err := uuid.Parse(c.Param("channel_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid channel ID")
	}

	body := ChannelUpdateRequestBody{}

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	if valid, reason := body.Validate(false); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	dbTx, err := a.Pool.Begin(c.Request().Context())

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	tx := a.Queries.WithTx(dbTx)

	defer dbTx.Rollback(c.Request().Context())

	sqlChannel, err := tx.UpdateChannel(c.Request().Context(), sqlc.UpdateChannelParams{
		ChannelID: channelID,
		Name:      body.Name,
		Topic:     body.Topic,
	})

	if err != nil {
		return NewServerError(err, "a.Queries.CreateGuildChannel")
	}

	channel := a.Mapper.ConvertSQLCChannelToUpdatedChannel(sqlChannel)

	updatedChannel := &message_queue.ForwardedPayload{
		Version:         0,
		Op:              "CHANNEL_UPDATE",
		Data:            channel,
		ExcludedUserIDs: []uuid.UUID{c.(*APIContext).UserID},
	}

	if channel.ChannelType < 2 || channel.ChannelType > 3 {
		roleIDs, err := a.Queries.GetRoleIDsByChannelID(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetRoleIDsByChannelID")
		}

		updatedChannel.RoleIDs = roleIDs
	} else {

		userIDs, err := a.Queries.GetPrivateChannelUserIDs(c.Request().Context(), channelID)

		if err != nil {
			return NewServerError(err, "GetPrivateChannelUserIDs")
		}

		updatedChannel.UserIDs = userIDs
	}

	a.MessageQueue.PublishForwardPayload(updatedChannel)
	return NewSuccessfulResponse(c, http.StatusOK, &channel)
}
