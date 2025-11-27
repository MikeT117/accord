package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"golang.org/x/oauth2"
)

var (
	GitlabProfileURL = "https://gitlab.com/api/v4/user"
)

func (o *OAuth) GetGitlabAuthCodeURL() (string, error) {
	nonce, err := o.generateNonce()

	if err != nil {
		return "", nil
	}

	return o.Gitlab.AuthCodeURL(nonce, oauth2.AccessTypeOffline), nil
}

func (o *OAuth) GetGitlabUser(ctx context.Context, code string) (*OAuthUser, error) {
	token, err := o.Gitlab.Exchange(ctx, code)
	if err != nil {
		return nil, ErrTokenExchange
	}

	profile, err := getGitlabProfile(token)
	if err != nil {
		return nil, ErrProfileRetrieval
	}

	return &OAuthUser{
		ID:    strconv.FormatInt(int64(profile.ID), 10),
		Email: profile.Email,
		Name:  profile.Name,
	}, nil
}

func getGitlabProfile(token *oauth2.Token) (*GitlabProfileResponse, error) {
	req, err := http.NewRequest(http.MethodGet, GitlabProfileURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set(
		echo.HeaderAuthorization,
		fmt.Sprintf("Bearer %s", token.AccessToken),
	)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	gitlabProfile := &GitlabProfileResponse{}
	if err := json.NewDecoder(resp.Body).Decode(&gitlabProfile); err != nil {
		return nil, err
	}

	return gitlabProfile, nil
}
