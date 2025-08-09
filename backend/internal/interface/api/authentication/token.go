package authentication

import (
	"time"

	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v2/jwa"
	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"
)

func CreateAndSignToken(issuer string, ID uuid.UUID, rawKey []byte, requestID string, expiresAt time.Time) (jwt.Token, []byte, error) {
	token, err := jwt.NewBuilder().Issuer(issuer).IssuedAt(time.Now()).Expiration(expiresAt).Claim("id", ID).Claim("requestId", requestID).Build()
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

func ValidateToken(token string, rawKey []byte) (jwt.Token, uuid.UUID, error) {
	jwkKey, err := jwk.FromRaw(rawKey)
	if err != nil {
		return nil, uuid.UUID{}, wrapUnknownErr("create jwk key failed", err)
	}

	parsedToken, err := jwt.ParseString(token, jwt.WithKey(jwa.HS256, jwkKey))
	if err != nil {
		return nil, uuid.UUID{}, wrapUnknownErr("parse token failed", err)
	}

	idFromToken, found := parsedToken.Get("id")
	if !found {
		return nil, uuid.UUID{}, ErrInvalidTokens
	}

	idUUID, err := uuid.Parse(idFromToken.(string))
	if err != nil {
		return nil, uuid.UUID{}, ErrInvalidTokens

	}

	return parsedToken, idUUID, nil
}
