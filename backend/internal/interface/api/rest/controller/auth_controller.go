package controller

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/interface/api/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/mapper"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
	"github.com/google/uuid"

	"github.com/labstack/echo/v4"
)

type AuthController struct {
	config                *config.Config
	sessionService        interfaces.SessionService
	authenticationService interfaces.AuthenticationService
	userAccountService    interfaces.UserAccountService
}

func NewAuthController(
	config *config.Config,
	baseGroup *echo.Group,
	sessionService interfaces.SessionService,
	authenticationService interfaces.AuthenticationService,
	userAccountService interfaces.UserAccountService,
) *AuthController {
	controller := &AuthController{
		config:                config,
		sessionService:        sessionService,
		authenticationService: authenticationService,
		userAccountService:    userAccountService,
	}

	subGroup := baseGroup.Group("/auth")

	subGroup.GET("/github", controller.HandleOAuthInit(constants.PROVIDER_OAUTH_GITHUB))
	subGroup.GET("/github/callback", controller.HandleOAuthCallback(constants.PROVIDER_OAUTH_GITHUB))

	subGroup.GET("/gitlab", controller.HandleOAuthInit(constants.PROVIDER_OAUTH_GITLAB))
	subGroup.GET("/gitlab/callback", controller.HandleOAuthCallback(constants.PROVIDER_OAUTH_GITLAB))

	subGroup.POST("/registration/complete", controller.HandleCompleteRegistration)
	subGroup.POST("/registration/username-unique", controller.HandleUsernameUnique)
	return controller
}

func (c *AuthController) HandleUsernameUnique(ctx echo.Context) error {
	var payload request.UniqueUsernameRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	_, _, _, err := authentication.ValidateRegistrationToken(payload.Token, c.config.JWTRegistrationTokenKey)
	if err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	isUsernameAvailable, err := c.userAccountService.GetUniqueUsername(ctx.Request().Context(), payload.Username)
	if err != nil {
		return response.ErrorResponse(ctx, http.StatusInternalServerError, nil)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToUniqueUsernameResponse(isUsernameAvailable))
}

func (ac *AuthController) HandleCompleteRegistration(ctx echo.Context) error {
	requestId := ctx.Response().Header().Get(echo.HeaderXRequestID)

	var payload request.CompleteUserRegistrationRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	_, id, _, err := authentication.ValidateRegistrationToken(payload.Token, ac.config.JWTRegistrationTokenKey)
	if err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	isUnique, err := ac.userAccountService.GetUniqueUsername(ctx.Request().Context(), payload.Username)
	if err != nil {
		return response.ErrorResponse(ctx, http.StatusInternalServerError, nil)
	}

	if !isUnique {
		return response.ErrorResponse(ctx, http.StatusBadRequest, "username unavailable")
	}

	err = ac.authenticationService.CompleteUserRegistration(ctx.Request().Context(), payload.ToCompleteUserRegistrationCommand(id))
	if err != nil {
		return response.ErrorResponse(ctx, http.StatusInternalServerError, nil)
	}

	_, accesstoken, err := authentication.CreateAndSignToken(
		ac.config.Host,
		id,
		ac.config.JWTAccesstokenKey,
		requestId,
		time.Now().UTC().Add(time.Hour),
	)
	if err != nil {
		return handleAuthError(ctx, ac.config.Host, err)
	}

	expiresAt := time.Now().UTC().Add(time.Hour * 168)
	_, refreshtoken, err := authentication.CreateAndSignToken(
		ac.config.Host,
		id,
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
			UserID:    id,
			Token:     string(refreshtoken),
			IPAddress: ctx.Request().RemoteAddr,
			UserAgent: ctx.Request().UserAgent(),
			ExpiresAt: expiresAt,
		},
	); err != nil {
		return handleAuthError(ctx, ac.config.Host, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, &response.CompleteRegistrationResponse{
		Accesstoken:  string(accesstoken),
		Refreshtoken: string(refreshtoken),
	})
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

		user, isRegistrationComplete, err := ac.authenticationService.CreateOrGetOAuthAccountUser(
			ctx.Request().Context(),
			oAuthProfile.ID,
			provider,
			oAuthProfile.Email,
			strings.ReplaceAll(uuid.New().String(), "-", ""),
			strings.ReplaceAll(uuid.New().String(), "-", ""),
		)
		if err != nil {
			return handleAuthError(ctx, ac.config.Host, err)
		}

		if !isRegistrationComplete {
			_, registrationToken, err := authentication.CreateAndSignRegistrationToken(ac.config.Host, user.Result.ID, provider, ac.config.JWTRegistrationTokenKey, requestId, time.Now().UTC().Add(time.Minute*5))
			if err != nil {
				return handleAuthError(ctx, ac.config.Host, err)
			}

			return response.TemporaryRedirect(ctx, fmt.Sprintf("%s/complete-registration?token=%s", ac.config.Host, registrationToken))
		}

		_, accesstoken, err := authentication.CreateAndSignToken(
			ac.config.Host,
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
			ac.config.Host,
			user.Result.ID,
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
				UserID:    user.Result.ID,
				Token:     string(refreshtoken),
				IPAddress: ctx.Request().RemoteAddr,
				UserAgent: ctx.Request().UserAgent(),
				ExpiresAt: expiresAt,
			},
		); err != nil {
			return handleAuthError(ctx, ac.config.Host, err)
		}

		return response.TemporaryRedirect(ctx, fmt.Sprintf("https://%s/auth?accesstoken=%s&refreshtoken=%s", ac.config.Host, accesstoken, refreshtoken))
	}
}
