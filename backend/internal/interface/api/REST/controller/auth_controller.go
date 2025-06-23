package controller

import (
	"fmt"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/response"

	"github.com/labstack/echo/v4"
)

type AuthController struct {
	config                *config.Config
	sessionService        interfaces.SessionService
	authenticationService interfaces.AuthenticationService
}

func NewAuthController(
	config *config.Config,
	baseGroup *echo.Group,
	sessionService interfaces.SessionService,
	authenticationService interfaces.AuthenticationService,
) *AuthController {
	controller := &AuthController{
		config:                config,
		sessionService:        sessionService,
		authenticationService: authenticationService,
	}

	subGroup := baseGroup.Group("/auth")
	subGroup.GET("/github", controller.HandleGithubAuthInit)
	subGroup.GET("/github/callback", controller.HandleGithubAuthCallback)
	return controller
}

func (ac *AuthController) HandleGithubAuthInit(ctx echo.Context) error {
	return response.TemporaryRedirect(ctx, ac.authenticationService.GetGithubAuthCodeURL())
}

func (ac *AuthController) HandleGithubAuthCallback(ctx echo.Context) error {
	user, err := ac.authenticationService.GetOrCreateGithubAccountUser(
		ctx.Request().Context(),
		ctx.QueryParam("code"),
		ctx.QueryParam("state"),
	)
	if err != nil {
		return handleAuthError(ctx, ac.config.Host, err)
	}

	requestId := ctx.Response().Header().Get(echo.HeaderXRequestID)
	_, accesstoken, err := authentication.CreateAndSignToken(
		ac.config.JWTIssuer,
		user.Result.ID,
		ac.config.JWTAccesstokenKey,
		requestId,
		time.Now().UTC().Add(time.Hour),
	)
	if err != nil {
		return handleAuthError(ctx, ac.config.Host, err)
	}

	expiresAt := time.Now().UTC().Add(time.Hour * 168)
	_, refreshtoken, err := authentication.CreateAndSignToken(
		ac.config.JWTIssuer,
		user.Result.ID,
		ac.config.JWTRefreshtokenKey,
		requestId,
		expiresAt,
	)
	if err != nil {
		return handleAuthError(ctx, ac.config.Host, err)
	}

	if err = ac.sessionService.CreateSession(
		ctx.Request().Context(),
		&command.CreateSessionCommand{
			UserID:    user.Result.ID,
			Token:     string(refreshtoken),
			IPAddress: ctx.Request().RemoteAddr,
			UserAgent: ctx.Request().UserAgent(),
			ExpiresAt: expiresAt,
		},
	); err != nil {
		return handleAuthError(ctx, ac.config.Host, err)
	}

	return response.TemporaryRedirect(
		ctx,
		fmt.Sprintf("https://%s?accesstoken=%s&refreshtoken=%s", ac.config.Host, accesstoken, refreshtoken),
	)
}
