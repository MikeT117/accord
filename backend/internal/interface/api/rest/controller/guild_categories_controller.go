package controller

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/mapper"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"

	"github.com/labstack/echo/v4"
)

type GuildCategoriesController struct {
	guildCategoryService interfaces.GuildCategoryService
}

func NewGuildCategoriesController(
	baseGroup *echo.Group,
	guildCategoryService interfaces.GuildCategoryService,
) *GuildCategoriesController {
	controller := &GuildCategoriesController{
		guildCategoryService: guildCategoryService,
	}

	subGroup := baseGroup.Group("/guild-categories")
	subGroup.GET("", controller.getGuildCategories)
	return controller
}

func (c *GuildCategoriesController) getGuildCategories(ctx echo.Context) error {
	guildCategories, err := c.guildCategoryService.GetAll(ctx.Request().Context())
	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToGuildCategoriesResponse(guildCategories.Result))
}
