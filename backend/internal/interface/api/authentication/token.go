package authentication

import (
	"time"

	"github.com/lestrrat-go/jwx/v2/jwa"
	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"
)

func CreateAndSignToken(issuer string, id string, rawKey []byte, requestId string, expiresAt time.Time) (jwt.Token, []byte, error) {
	token, err := jwt.NewBuilder().Issuer(issuer).IssuedAt(time.Now()).Expiration(expiresAt).Claim("id", id).Claim("requestId", requestId).Build()
	if err != nil {
		return nil, []byte{}, wrapUnknownErr("create token failed", err)
	}

	jwkKey, err := jwk.FromRaw(rawKey)
	if err != nil {
		return nil, []byte{}, err
	}

	serialized, err := jwt.Sign(token, jwt.WithKey(jwa.HS256, jwkKey))
	if err != nil {
		return nil, []byte{}, wrapUnknownErr("sign token failed", err)
	}

	return token, serialized, nil
}

func ValidateToken(token string, rawKey []byte) (jwt.Token, string, error) {
	jwkKey, err := jwk.FromRaw(rawKey)
	if err != nil {
		return nil, "", wrapUnknownErr("create jwk key failed", err)
	}

	parsedToken, err := jwt.ParseString(token, jwt.WithKey(jwa.HS256, jwkKey))
	if err != nil {
		return nil, "", wrapUnknownErr("parse token failed", err)
	}

	id, found := parsedToken.Get("id")
	if !found {
		return nil, "", ErrInvalidTokens
	}

	return parsedToken, id.(string), nil
}
