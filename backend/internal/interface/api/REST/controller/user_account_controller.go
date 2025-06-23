package controller

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/mapper"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/response"

	"github.com/labstack/echo/v4"
)

type UserAccountController struct {
	userAccontService interfaces.UserAccountService
}

func NewUserAccountController(
	baseGroup *echo.Group,
	userAccontService interfaces.UserAccountService,
) *UserAccountController {
	controller := &UserAccountController{
		userAccontService: userAccontService,
	}

	subGroup := baseGroup.Group("/users")
	subGroup.GET("/me", controller.GetRequestUser)
	subGroup.PATCH("/me", controller.UpdateRequestUser)
	return controller
}

func (c *UserAccountController) GetRequestUser(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)
	user, err := c.userAccontService.GetByID(ctx.Request().Context(), requestorID)

	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToUserResponse(user.Result))
}

func (c *UserAccountController) UpdateRequestUser(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)

	var payload request.UpdateUserRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	updateUserCommand := payload.ToUpdateUserCommand()

	if err := c.userAccontService.UpdateUserAccount(
		ctx.Request().Context(),
		updateUserCommand,
		requestorID,
	); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
