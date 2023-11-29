package authentication

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

type GithubProfile struct {
	Login             string    `json:"login"`
	ID                int       `json:"id"`
	NodeID            string    `json:"node_id"`
	AvatarURL         string    `json:"avatar_url"`
	GravatarID        string    `json:"gravatar_id"`
	URL               string    `json:"url"`
	HTMLURL           string    `json:"html_url"`
	FollowersURL      string    `json:"followers_url"`
	FollowingURL      string    `json:"following_url"`
	GistsURL          string    `json:"gists_url"`
	StarredURL        string    `json:"starred_url"`
	SubscriptionsURL  string    `json:"subscriptions_url"`
	OrganizationsURL  string    `json:"organizations_url"`
	ReposURL          string    `json:"repos_url"`
	EventsURL         string    `json:"events_url"`
	ReceivedEventsURL string    `json:"received_events_url"`
	Type              string    `json:"type"`
	SiteAdmin         bool      `json:"site_admin"`
	Name              string    `json:"name"`
	Company           any       `json:"company"`
	Blog              string    `json:"blog"`
	Location          string    `json:"location"`
	Email             any       `json:"email"`
	Hireable          any       `json:"hireable"`
	Bio               string    `json:"bio"`
	TwitterUsername   any       `json:"twitter_username"`
	PublicRepos       int       `json:"public_repos"`
	PublicGists       int       `json:"public_gists"`
	Followers         int       `json:"followers"`
	Following         int       `json:"following"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type GithubEmail struct {
	Email      string `json:"email"`
	Primary    bool   `json:"primary"`
	Verified   bool   `json:"verified"`
	Visibility string `json:"visibility"`
}

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

func GetGithubProfile(token *oauth2.Token) (*GithubProfile, error) {
	req, err := http.NewRequest(http.MethodGet, GithubProfileURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", token.AccessToken))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	githubProfile := GithubProfile{}

	if err := json.NewDecoder(resp.Body).Decode(&githubProfile); err != nil {
		return nil, err
	}

	return &githubProfile, nil
}

func GetGithubEmails(token *oauth2.Token) ([]GithubEmail, error) {
	req, err := http.NewRequest(http.MethodGet, GuthubEmailURL, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", token.AccessToken))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	githubEmails := []GithubEmail{}

	if err := json.NewDecoder(resp.Body).Decode(&githubEmails); err != nil {
		return nil, err
	}

	return githubEmails, nil
}
