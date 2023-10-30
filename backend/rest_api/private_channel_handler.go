package rest_api

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/labstack/echo/v4"
)

func (a *api) HandlePrivateChannelCreate(c echo.Context) error {
	// TODO: Check users have not blocked each other
	var body GroupChannelCreateBody

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	reqCtx := c.Request().Context()
	dbtx, err := a.Pool.Begin(reqCtx)

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer dbtx.Rollback(reqCtx)
	tx := a.Queries.WithTx(dbtx)

	var channelType int16

	if len(body.Recipients) > 1 {
		channelType = 3
	} else {
		channelType = 2
	}

	cctx := c.(*APIContext)

	sqlDirectChannel, err := tx.CreateDirectChannel(reqCtx, sqlc.CreateDirectChannelParams{
		ChannelType: channelType,
		CreatorID:   cctx.UserID,
	})

	if err != nil {
		return NewServerError(err, "tx.CreateDirectChannel")
	}

	recipientIDs := append(body.Recipients, cctx.UserID)

	rowsAffected, err := tx.CreateDirectChannelRecipients(reqCtx, sqlc.CreateDirectChannelRecipientsParams{
		ChannelID: sqlDirectChannel.ID,
		UserIds:   recipientIDs,
	})

	if err != nil {
		return NewServerError(err, "tx.CreateDirectChannelRecipients")
	}

	if rowsAffected != int64(len(body.Recipients)+1) {
		return NewClientError(nil, http.StatusBadRequest, "user not found")
	}

	sqlUsers, err := a.Queries.GetManyUsersByIDs(reqCtx, recipientIDs)

	if err != nil {
		return NewServerError(err, "a.Queries.GetManyUsersByIds")
	}

	directChannel := a.Mapper.ConvertSQLCChannelToDirectChannel(sqlDirectChannel)
	directChannel.Recipients = a.Mapper.ConvertSQLCGetManyUsersByIDsRowToUsers(sqlUsers)

	dbtx.Commit(reqCtx)

	return NewSuccessfulResponse(c, http.StatusOK, &directChannel)
}
