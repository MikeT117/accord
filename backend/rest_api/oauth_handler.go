package rest_api

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/MikeT117/accord/backend/internal/authentication"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
	"golang.org/x/oauth2"
)

func (a *api) HandleGithubAuthRedirect(c echo.Context) error {
	github := authentication.NewGithubOAuthConfig()
	state := uuid.NewString()
	authentication.StateStore.Insert(state)
	return c.Redirect(http.StatusTemporaryRedirect, github.AuthCodeURL(state, oauth2.AccessTypeOffline))
}

func (a *api) HandleGithubAuthCallback(c echo.Context) error {
	ctx := c.Request().Context()

	code := c.QueryParam("code")
	state := c.QueryParam("state")

	if len(state) == 0 {
		return NewClientError(nil, http.StatusBadRequest, "invalid state")
	}

	if !authentication.StateStore.Get(state) {
		return NewClientError(nil, http.StatusBadRequest, "invalid or expired state")
	}

	if len(code) == 0 {
		return NewClientError(nil, http.StatusBadRequest, "invalid code")
	}

	github := authentication.NewGithubOAuthConfig()
	token, err := github.Exchange(ctx, code)

	if err != nil {
		return NewServerError(err, "github.Exchange")
	}

	profile, err := authentication.GetGithubProfile(token)
	if err != nil {
		return NewServerError(err, "authentication.GetGithubProfile")
	}

	emails, err := authentication.GetGithubEmails(token)
	if err != nil {
		return NewServerError(err, "authentication.GetGithubEmails")
	}

	tx, err := a.Pool.Begin(ctx)

	if err != nil {
		return NewServerError(err, "a.Pool.Begin")
	}

	defer tx.Rollback(ctx)

	rtx := a.Queries.WithTx(tx)

	oauthAccount, err := rtx.CreateOrGetOAuth(ctx, sqlc.CreateOrGetOAuthParams{
		Email:         emails[0].Email,
		Provider:      "Github",
		ProviderToken: token.AccessToken,
		ProviderID:    fmt.Sprint(profile.ID),
	})

	if err != nil {
		return NewServerError(err, "h.Repository.CreateOrGetOAuthAccount")
	}

	user, err := rtx.CreateOrGetUser(ctx, sqlc.CreateOrGetUserParams{
		DisplayName:    profile.Login,
		OauthAccountID: oauthAccount.ID,
	})

	if err != nil {
		return NewServerError(err, "h.Repository.CreateOrGetUser")
	}

	requestId := c.Response().Header().Get(echo.HeaderXRequestID)

	_, accesstoken, err := authentication.CreateAndSignToken(user.ID.String(), []byte(os.Getenv("JWT_ACCESSTOKEN_KEY")), requestId, time.Now().Add(time.Hour))

	if err != nil {
		return NewServerError(err, "authentication.CreateAndSignToken(accesstoken)")
	}

	expiresAt := time.Now().Add(time.Hour * 168)
	_, refreshtoken, err := authentication.CreateAndSignToken(user.ID.String(), []byte(os.Getenv("JWT_REFRESHTOKEN_KEY")), requestId, expiresAt)

	if err != nil {
		return NewServerError(err, "authentication.CreateAndSignToken(refreshtoken)")
	}

	_, err = rtx.CreateUserSession(ctx, sqlc.CreateUserSessionParams{
		UserID: user.ID,
		Token:  string(refreshtoken),
		ExpiresAt: pgtype.Timestamp{
			Time:  expiresAt,
			Valid: true,
		},
	})

	if err != nil {
		return NewServerError(err, "h.Queries.CreateSession")
	}

	if err := tx.Commit(ctx); err != nil {
		return NewServerError(err, "tx.Commit")
	}

	return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?accesstoken=%s&refreshtoken=%s", os.Getenv("HOST"), accesstoken, refreshtoken))
}
