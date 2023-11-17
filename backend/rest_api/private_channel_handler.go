package rest_api

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/labstack/echo/v4"
)

// TODO: Check users have not blocked each other
func (a *api) HandlePrivateChannelCreate(c echo.Context) error {
	var body PrivateChannelCreateBody

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "Unable to bind body")
	}

	sqlPrivateChannel, err := a.Queries.GetPrivateChannelByUsers(c.Request().Context(), sqlc.GetPrivateChannelByUsersParams{
		UserIds:  append(body.Recipients, c.(*APIContext).UserID),
		UsersLen: int32(len(body.Recipients) + 1),
	})

	if database.IsPGErrNoRows(err) {
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

		sqlPrivateChannel, err = tx.CreatePrivateChannel(reqCtx, sqlc.CreatePrivateChannelParams{
			ChannelType: channelType,
			CreatorID:   cctx.UserID,
		})

		if err != nil {
			return NewServerError(err, "tx.CreateDirectChannel")
		}

		recipientIDs := append(body.Recipients, cctx.UserID)

		rowsAffected, err := tx.CreatePrivateChannelRecipients(reqCtx, sqlc.CreatePrivateChannelRecipientsParams{
			ChannelID: sqlPrivateChannel.ID,
			UserIds:   recipientIDs,
		})

		if err != nil {
			return NewServerError(err, "tx.CreateDirectChannelRecipients")
		}

		if rowsAffected != int64(len(body.Recipients)+1) {
			return NewClientError(nil, http.StatusBadRequest, "user not found")
		}

		dbtx.Commit(reqCtx)
	} else if err != nil {
		return NewServerError(err, "GetPrivateChannelByUsers")
	}

	sqlUsers, err := a.Queries.GetManyUsersByIDs(c.Request().Context(), body.Recipients)

	if err != nil {
		return NewServerError(err, "a.Queries.GetManyUsersByIds")
	}

	privateChannel := a.Mapper.ConvertSQLCChannelToPrivateChannel(sqlPrivateChannel)
	privateChannel.Users = a.Mapper.ConvertSQLCGetManyUsersByIDsRowToUsers(sqlUsers)

	return NewSuccessfulResponse(c, http.StatusOK, &privateChannel)
}
