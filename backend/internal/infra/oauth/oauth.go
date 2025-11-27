package oauth

import (
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/gitlab"
)

type OAuth struct {
	nonceKey string
	Gitlab   oauth2.Config
	Github   oauth2.Config
}

func NewOAuthConfig(
	githubKey string,
	githubSecret string,
	githubRedirectURL string,

	gitlabKey string,
	gitlabSecret string,
	gitlabRedirectURL string,

	nonceKey string,
) *OAuth {
	return &OAuth{
		nonceKey: nonceKey,
		Github: oauth2.Config{
			ClientID:     githubKey,
			ClientSecret: githubSecret,
			RedirectURL:  githubRedirectURL,
			Scopes:       []string{"user:email"},
			Endpoint:     github.Endpoint,
		},
		Gitlab: oauth2.Config{
			ClientID:     gitlabKey,
			ClientSecret: gitlabSecret,
			RedirectURL:  gitlabRedirectURL,
			Scopes:       []string{"read_user"},
			Endpoint:     gitlab.Endpoint,
		},
	}
}
