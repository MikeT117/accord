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

type SessionController struct {
	sessionService interfaces.SessionService
}

func NewSessionController(baseGroup *echo.Group, sessionService interfaces.SessionService) *SessionController {
	controller := &SessionController{
		sessionService: sessionService,
	}

	subGroup := baseGroup.Group("/sessions")
	subGroup.GET("", controller.GetSessions)
	subGroup.GET("/current", controller.GetCurrentSession)
	subGroup.DELETE("/:sessionID", controller.DeleteSession)
	return controller
}

func (c *SessionController) GetCurrentSession(ctx echo.Context) error {
	userID, sessionID := authentication.GetRequestorDetails(ctx)
	session, err := c.sessionService.GetByID(
		ctx.Request().Context(),
		sessionID,
		userID,
	)
	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(
		ctx,
		http.StatusOK,
		mapper.ToSessionResponse(session.Result),
	)
}

func (c *SessionController) GetSessions(ctx echo.Context) error {
	userID, _ := authentication.GetRequestorDetails(ctx)

	sessions, err := c.sessionService.GetByUserID(
		ctx.Request().Context(),
		userID,
	)
	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToSessionsResponse(sessions.Result))
}

func (c *SessionController) DeleteSession(ctx echo.Context) error {
	userID, _ := authentication.GetRequestorDetails(ctx)
	var payload request.DeleteSessionRequest

	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	if err := c.sessionService.DeleteSessionByID(
		ctx.Request().Context(),
		payload.SessionID,
		userID); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
