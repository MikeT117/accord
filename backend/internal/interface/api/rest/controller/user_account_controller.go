package controller

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/interface/api/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/mapper"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"

	"github.com/labstack/echo/v4"
)

type UserAccountController struct {
	userAccountService interfaces.UserAccountService
}

func NewUserAccountController(
	baseGroup *echo.Group,
	userAccountService interfaces.UserAccountService,
) *UserAccountController {
	controller := &UserAccountController{
		userAccountService: userAccountService,
	}

	subGroup := baseGroup.Group("/users")
	subGroup.GET("/:userID/profile", controller.getUserProfile)
	subGroup.PATCH("/:userID", controller.updateUser)
	return controller
}

func (c *UserAccountController) getUserProfile(ctx echo.Context) error {
	var payload request.QueryUserRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	user, err := c.userAccountService.GetByID(ctx.Request().Context(), requestorID)

	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToUserResponse(user.Result))
}

func (c *UserAccountController) updateUser(ctx echo.Context) error {
	var payload request.UpdateUserRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToUpdateUserCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.userAccountService.UpdateUserAccount(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
