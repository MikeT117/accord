package rest_api

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func (a *api) HandleUserSessionRead(c echo.Context) error {
	cctx := c.(*APIContext)

	sqlSessions, err := a.Queries.GetManyUserSessionsByID(c.Request().Context(), cctx.UserID)

	if err != nil {
		return NewServerError(err, "a.Queries.GetManyUserSessionsByID")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConverSQLCUserSessionsToUserSessions(sqlSessions))
}
