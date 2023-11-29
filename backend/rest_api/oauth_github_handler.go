package rest_api

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/MikeT117/accord/backend/internal/authentication"
	"github.com/MikeT117/accord/backend/internal/database"
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
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=invalid+state", os.Getenv("HOST")))
	}

	if !authentication.StateStore.Get(state) {
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=invalid+state", os.Getenv("HOST")))
	}

	if len(code) == 0 {
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=invalid+code", os.Getenv("HOST")))
	}

	github := authentication.NewGithubOAuthConfig()
	token, err := github.Exchange(ctx, code)

	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=unknown+error+occurred", os.Getenv("HOST")))
	}

	profile, err := authentication.GetGithubProfile(token)
	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=unknown+error+occurred", os.Getenv("HOST")))
	}

	emails, err := authentication.GetGithubEmails(token)
	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=unknown+error+occurred", os.Getenv("HOST")))
	}

	tx, err := a.Pool.Begin(ctx)

	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=unknown+error+occurred", os.Getenv("HOST")))
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
		if database.IsPGErrorConstraint(err, "oauth_accounts_email_key") {
			return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=duplicate+account", os.Getenv("HOST")))
		}
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=unknown+error+occurred", os.Getenv("HOST")))
	}

	user, err := rtx.CreateOrGetUser(ctx, sqlc.CreateOrGetUserParams{
		Username:       profile.Login,
		DisplayName:    profile.Login,
		OauthAccountID: oauthAccount.ID,
	})

	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=unknown+error+occurred", os.Getenv("HOST")))
	}

	requestId := c.Response().Header().Get(echo.HeaderXRequestID)

	_, accesstoken, err := authentication.CreateAndSignToken(user.ID.String(), []byte(os.Getenv("JWT_ACCESSTOKEN_KEY")), requestId, time.Now().Add(time.Hour))

	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=unknown+error+occurred", os.Getenv("HOST")))
	}

	expiresAt := time.Now().Add(time.Hour * 168)
	_, refreshtoken, err := authentication.CreateAndSignToken(user.ID.String(), []byte(os.Getenv("JWT_REFRESHTOKEN_KEY")), requestId, expiresAt)

	if err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=unknown+error+occurred", os.Getenv("HOST")))
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
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=unknown+error+occurred", os.Getenv("HOST")))
	}

	if err := tx.Commit(ctx); err != nil {
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?error=unknown+error+occurred", os.Getenv("HOST")))
	}

	return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("https://%s?accesstoken=%s&refreshtoken=%s", os.Getenv("HOST"), accesstoken, refreshtoken))
}
