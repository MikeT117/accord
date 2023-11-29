package authentication

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/gitlab"
)

type GitlabProfileReponsePayload struct {
	ID                             int       `json:"id"`
	Username                       string    `json:"username"`
	Name                           string    `json:"name"`
	State                          string    `json:"state"`
	Locked                         bool      `json:"locked"`
	AvatarURL                      string    `json:"avatar_url"`
	WebURL                         string    `json:"web_url"`
	CreatedAt                      time.Time `json:"created_at"`
	Bio                            string    `json:"bio"`
	Location                       string    `json:"location"`
	PublicEmail                    string    `json:"public_email"`
	Skype                          string    `json:"skype"`
	Linkedin                       string    `json:"linkedin"`
	Twitter                        string    `json:"twitter"`
	Discord                        string    `json:"discord"`
	WebsiteURL                     string    `json:"website_url"`
	Organization                   string    `json:"organization"`
	JobTitle                       string    `json:"job_title"`
	Pronouns                       string    `json:"pronouns"`
	Bot                            bool      `json:"bot"`
	WorkInformation                any       `json:"work_information"`
	LocalTime                      any       `json:"local_time"`
	LastSignInAt                   time.Time `json:"last_sign_in_at"`
	ConfirmedAt                    time.Time `json:"confirmed_at"`
	LastActivityOn                 string    `json:"last_activity_on"`
	Email                          string    `json:"email"`
	ThemeID                        int       `json:"theme_id"`
	ColorSchemeID                  int       `json:"color_scheme_id"`
	ProjectsLimit                  int       `json:"projects_limit"`
	CurrentSignInAt                time.Time `json:"current_sign_in_at"`
	Identities                     []any     `json:"identities"`
	CanCreateGroup                 bool      `json:"can_create_group"`
	CanCreateProject               bool      `json:"can_create_project"`
	TwoFactorEnabled               bool      `json:"two_factor_enabled"`
	External                       bool      `json:"external"`
	PrivateProfile                 bool      `json:"private_profile"`
	CommitEmail                    string    `json:"commit_email"`
	SharedRunnersMinutesLimit      any       `json:"shared_runners_minutes_limit"`
	ExtraSharedRunnersMinutesLimit any       `json:"extra_shared_runners_minutes_limit"`
	ScimIdentities                 []any     `json:"scim_identities"`
}

var GitlabProfileURL = "https://gitlab.com/api/v4/user"

func NewGitlabOAuthConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     os.Getenv("GITLAB_APP_ID"),
		ClientSecret: os.Getenv("GITLAB_SECRET"),
		RedirectURL:  os.Getenv("GITLAB_REDIRECT_URL"),
		Scopes:       []string{"read_user"},
		Endpoint:     gitlab.Endpoint,
	}
}

func GetGitlabProfile(token *oauth2.Token) (*GitlabProfileReponsePayload, error) {
	req, err := http.NewRequest(http.MethodGet, GitlabProfileURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set(echo.HeaderAuthorization, fmt.Sprintf("Bearer %s", token.AccessToken))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	gitlabProfile := &GitlabProfileReponsePayload{}

	if err := json.NewDecoder(resp.Body).Decode(gitlabProfile); err != nil {
		return nil, err
	}

	return gitlabProfile, nil
}
