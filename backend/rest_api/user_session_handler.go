package rest_api

import (
	"net/http"
	"strconv"

	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleUserSessionReadMany(c echo.Context) error {

	params := &sqlc.GetManyUserSessionsByIDParams{
		Token:  c.(*APIContext).Refreshtoken,
		UserID: c.(*APIContext).UserID,
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

	sqlSessions, err := a.Queries.GetManyUserSessionsByID(c.Request().Context(), *params)

	if err != nil {
		return NewServerError(err, "a.Queries.GetManyUserSessionsByID")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetManyUserSessionsByIDRowToUserSessions(sqlSessions))
}

func (a *api) HandleUserSessionDelete(c echo.Context) error {
	sessionID, err := uuid.Parse(c.Param("session_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid session ID")
	}

	rowsAffected, err := a.Queries.DeleteUserSession(c.Request().Context(), sqlc.DeleteUserSessionParams{
		SessionID: sessionID,
		UserID:    c.(*APIContext).UserID,
		Token:     c.(*APIContext).Refreshtoken,
	})

	if err != nil {
		return NewServerError(err, "DeleteUserSession")
	}

	if rowsAffected != int64(1) {
		return NewClientError(nil, http.StatusNotFound, "session not found")
	}

	return NewSuccessfulResponse(c, http.StatusNoContent, nil)
}
