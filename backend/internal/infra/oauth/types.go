package oauth

import "time"

type GithubEmailResponse struct {
	Email      string `json:"email"`
	Primary    bool   `json:"primary"`
	Verified   bool   `json:"verified"`
	Visibility string `json:"visibility"`
}

type GithubProfileResponse struct {
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

type GitlabProfileResponse struct {
	ID                             int       `json:"id"`
	Username                       string    `json:"username"`
	PublicEmail                    string    `json:"public_email"`
	Name                           string    `json:"name"`
	State                          string    `json:"state"`
	Locked                         bool      `json:"locked"`
	AvatarURL                      string    `json:"avatar_url"`
	WebURL                         string    `json:"web_url"`
	CreatedAt                      time.Time `json:"created_at"`
	Bio                            string    `json:"bio"`
	Location                       string    `json:"location"`
	Linkedin                       string    `json:"linkedin"`
	Twitter                        string    `json:"twitter"`
	Discord                        string    `json:"discord"`
	WebsiteURL                     string    `json:"website_url"`
	Github                         string    `json:"github"`
	JobTitle                       string    `json:"job_title"`
	Pronouns                       string    `json:"pronouns"`
	Organization                   string    `json:"organization"`
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
	Identities                     any       `json:"identities"`
	CanCreateGroup                 bool      `json:"can_create_group"`
	CanCreateProject               bool      `json:"can_create_project"`
	TwoFactorEnabled               bool      `json:"two_factor_enabled"`
	External                       bool      `json:"external"`
	PrivateProfile                 bool      `json:"private_profile"`
	CommitEmail                    string    `json:"commit_email"`
	PreferredLanguage              string    `json:"preferred_language"`
	SharedRunnersMinutesLimit      any       `json:"shared_runners_minutes_limit"`
	ExtraSharedRunnersMinutesLimit any       `json:"extra_shared_runners_minutes_limit"`
	ScimIdentities                 []any     `json:"scim_identities"`
}

type OAuthUser struct {
	ID    string
	Email string
	Name  string
}
