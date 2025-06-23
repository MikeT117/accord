package oauth

import "errors"

var (
	ErrTokenExchange    = errors.New("oauth token exchange failed")
	ErrProfileRetrieval = errors.New("get profile from oauth provider failed")
	ErrEmailRetrieval   = errors.New("get email from oauth provider failed")
	ErrInvalidNonce     = errors.New("invalid nonce")
)

func IsOauthError(err error) bool {
	return errors.Is(err, ErrEmailRetrieval) || errors.Is(err, ErrInvalidNonce) || errors.Is(err, ErrProfileRetrieval) || errors.Is(err, ErrTokenExchange)
}
