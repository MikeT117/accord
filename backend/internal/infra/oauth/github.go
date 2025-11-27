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
	GithubProfileURL = "https://api.github.com/user"
	GuthubEmailURL   = "https://api.github.com/user/emails"
)

func (o *OAuth) GetGithubAuthCodeURL() (string, error) {
	nonce, err := o.generateNonce()

	if err != nil {
		return "", nil
	}

	return o.Github.AuthCodeURL(nonce, oauth2.AccessTypeOffline), nil
}

func (o *OAuth) GetGithubUser(ctx context.Context, code string) (*OAuthUser, error) {
	token, err := o.Github.Exchange(ctx, code)
	if err != nil {
		return nil, ErrTokenExchange
	}

	profile, err := getGithubProfile(token)
	if err != nil {
		return nil, ErrProfileRetrieval
	}

	emails, err := getGithubEmails(token)
	if err != nil {
		return nil, ErrEmailRetrieval
	}

	return &OAuthUser{
		ID:    strconv.FormatInt(int64(profile.ID), 10),
		Email: emails[0].Email,
		Name:  profile.Name,
	}, nil
}

func getGithubProfile(token *oauth2.Token) (*GithubProfileResponse, error) {
	req, err := http.NewRequest(http.MethodGet, GithubProfileURL, nil)
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

	githubProfile := &GithubProfileResponse{}
	if err := json.NewDecoder(resp.Body).Decode(&githubProfile); err != nil {
		return nil, err
	}

	return githubProfile, nil
}

func getGithubEmails(token *oauth2.Token) ([]GithubEmailResponse, error) {
	req, err := http.NewRequest(http.MethodGet, GuthubEmailURL, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", token.AccessToken))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	githubEmails := []GithubEmailResponse{}
	if err := json.NewDecoder(resp.Body).Decode(&githubEmails); err != nil {
		return nil, err
	}

	return githubEmails, nil
}
