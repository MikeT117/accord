package controller

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"

	"github.com/MikeT117/accord/backend/internal/application/services"
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/infra/oauth"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
	"github.com/labstack/echo/v4"
)

func handleError(ctx echo.Context, err error) error {
	log.Println(err)
	var echoHTTPErr *echo.HTTPError
	switch {
	case domain.IsDomainValidationErr(err):
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	case domain.IsDomainNotFoundErr(err):
		return response.ErrorResponse(ctx, http.StatusNotFound, nil)
	case services.IsServiceNotAuthorisedErr(err):
		return response.ErrorResponse(ctx, http.StatusUnauthorized, nil)
	case request.IsRequestValidationErr(err):
		return response.ErrorResponse(ctx, http.StatusBadRequest, err.Error())
	case errors.As(err, &echoHTTPErr):
		if err.(*echo.HTTPError).Code == http.StatusBadRequest {
			return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
		}
		return response.ErrorResponse(ctx, http.StatusInternalServerError, nil)
	default:
		return response.ErrorResponse(ctx, http.StatusInternalServerError, nil)
	}
}

func handleAuthError(ctx echo.Context, host string, err error) error {
	log.Println(err)

	var errMsg string
	if oauth.IsOauthError(err) {
		errMsg = url.QueryEscape(err.Error())
	} else {
		errMsg = "unknown+error+occurred"
	}

	return response.TemporaryRedirect(ctx,
		fmt.Sprintf("https://%s?error=%s", host, errMsg),
	)
}
