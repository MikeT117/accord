package rest_api

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func (a *api) HandleGuildCategoryReadMany(c echo.Context) error {
	sqlGuildCategories, err := a.Queries.GetManyGuildCategories(c.Request().Context())

	if err != nil {
		return NewServerError(err, "a.Queries.GetGuildCategories")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGuildCategoryToGuildCategories(sqlGuildCategories))
}
