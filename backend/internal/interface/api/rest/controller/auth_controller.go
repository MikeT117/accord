package controller

import (
	"fmt"
	"net/http"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/interface/api/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/mapper"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"

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

	subGroup.GET("/github", controller.HandleOAuthInit(constants.PROVIDER_OAUTH_GITHUB))
	subGroup.GET("/github/callback", controller.HandleOAuthCallback(constants.PROVIDER_OAUTH_GITHUB))

	subGroup.GET("/gitlab", controller.HandleOAuthInit(constants.PROVIDER_OAUTH_GITLAB))
	subGroup.GET("/gitlab/callback", controller.HandleOAuthCallback(constants.PROVIDER_OAUTH_GITLAB))

	subGroup.GET("/register/unique-username", controller.HandleUniqueUsername)
	subGroup.POST("/register", controller.HandleRegister)

	return controller
}

func (ac *AuthController) HandleUniqueUsername(ctx echo.Context) error {
	var payload request.UniqueUsernameRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	isUnique, err := ac.authenticationService.GetUniqueUsername(ctx.Request().Context(), payload.Username)
	if err != nil {
		return response.ErrorResponse(ctx, http.StatusInternalServerError, nil)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToUniqueUsernameResponse(isUnique))
}

func (ac *AuthController) HandleRegister(ctx echo.Context) error {
	var payload request.CreateUserRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	_, id, email, provider, err := authentication.ValidateTempToken(payload.Token, ac.config.JWTTempTokenKey)
	if err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	isUnique, err := ac.authenticationService.GetUniqueUsername(ctx.Request().Context(), payload.Username)
	if err != nil {
		return response.ErrorResponse(ctx, http.StatusInternalServerError, nil)
	}

	if !isUnique {
		return response.ErrorResponse(ctx, http.StatusBadRequest, "username unavailable")
	}

	if _, err := ac.authenticationService.CreateOAuthAccountUser(
		ctx.Request().Context(),
		id,
		provider,
		email,
		payload.Username,
		payload.DisplayName,
	); err != nil {
		return response.ErrorResponse(ctx, http.StatusInternalServerError, nil)
	}

	return response.NoContentResponse(ctx)
}

func (ac *AuthController) HandleOAuthInit(provider string) func(ctx echo.Context) error {
	return func(ctx echo.Context) error {
		redirectURL, err := ac.authenticationService.GetOAuthCodeURL(provider)
		if err != nil {
			return handleAuthError(ctx, ac.config.Host, err)
		}
		return response.TemporaryRedirect(ctx, redirectURL)
	}
}

func (ac *AuthController) HandleOAuthCallback(provider string) func(ctx echo.Context) error {
	return func(ctx echo.Context) error {

		requestId := ctx.Response().Header().Get(echo.HeaderXRequestID)

		oAuthProfile, err := ac.authenticationService.GetOAuthProfile(
			ctx.Request().Context(),
			ctx.QueryParam("code"),
			ctx.QueryParam("state"),
			provider,
		)

		if err != nil {
			return handleAuthError(ctx, ac.config.Host, err)
		}

		userID, err := ac.authenticationService.GetUserIDByProviderID(ctx.Request().Context(), oAuthProfile.ID, provider)
		if err != nil {

			if domain.IsDomainNotFoundErr(err) {

				_, temptoken, err := authentication.CreateAndSignTempToken(
					ac.config.JWTIssuer,
					oAuthProfile.ID,
					oAuthProfile.Email,
					provider,
					ac.config.JWTTempTokenKey,
					requestId,
					time.Now().UTC().Add(time.Minute*4),
				)

				if err != nil {
					return handleAuthError(ctx, ac.config.Host, err)
				}

				return response.TemporaryRedirect(
					ctx,
					fmt.Sprintf("https://%s/onboarding?token=%s", ac.config.Host, temptoken),
				)

			}

			return handleAuthError(ctx, ac.config.Host, err)
		}

		_, accesstoken, err := authentication.CreateAndSignToken(
			ac.config.JWTIssuer,
			userID,
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
			userID,
			ac.config.JWTRefreshtokenKey,
			requestId,
			expiresAt,
		)
		if err != nil {
			return handleAuthError(ctx, ac.config.Host, err)
		}

		if err = ac.sessionService.Create(
			ctx.Request().Context(),
			&command.CreateSessionCommand{
				UserID:    userID,
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
			fmt.Sprintf("https://%s/auth?accesstoken=%s&refreshtoken=%s", ac.config.Host, accesstoken, refreshtoken),
		)
	}

}
