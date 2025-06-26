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

type SessionController struct {
	sessionService interfaces.SessionService
}

func NewSessionController(baseGroup *echo.Group, sessionService interfaces.SessionService) *SessionController {
	controller := &SessionController{
		sessionService: sessionService,
	}

	subGroup := baseGroup.Group("/sessions")
	subGroup.GET("", controller.getSessions)
	subGroup.GET("/current", controller.getCurrentSession)
	subGroup.DELETE("/:sessionID", controller.deleteSession)
	return controller
}

func (c *SessionController) getCurrentSession(ctx echo.Context) error {
	requestorID, sessionID := authentication.GetRequestorDetails(ctx)
	session, err := c.sessionService.GetByID(
		ctx.Request().Context(),
		sessionID,
		requestorID,
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

func (c *SessionController) getSessions(ctx echo.Context) error {
	requestorID, _ := authentication.GetRequestorDetails(ctx)
	sessions, err := c.sessionService.GetByUserID(
		ctx.Request().Context(),
		requestorID,
	)
	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToSessionsResponse(sessions.Result))
}

func (c *SessionController) deleteSession(ctx echo.Context) error {
	var payload request.DeleteSessionRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteSessionCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.sessionService.Delete(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
