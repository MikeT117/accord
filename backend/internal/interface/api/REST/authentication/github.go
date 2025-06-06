package authentication

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

var (
	GithubProfileURL = "https://api.github.com/user"
	GuthubEmailURL   = "https://api.github.com/user/emails"
)

func NewGithubOAuthConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     os.Getenv("GITHUB_KEY"),
		ClientSecret: os.Getenv("GITHUB_SECRET"),
		RedirectURL:  os.Getenv("GITHUB_REDIRECT_URL"),
		Scopes:       []string{"user:email"},
		Endpoint:     github.Endpoint,
	}
}

func GetGithubProfile(token *oauth2.Token) (*GithubProfileResponse, error) {
	req, err := http.NewRequest(http.MethodGet, GithubProfileURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", token.AccessToken))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	githubProfile := GithubProfileResponse{}

	if err := json.NewDecoder(resp.Body).Decode(&githubProfile); err != nil {
		return nil, err
	}

	return &githubProfile, nil
}

func GetGithubEmails(token *oauth2.Token) ([]GithubEmailResponse, error) {
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
