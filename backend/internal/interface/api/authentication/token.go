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
		return nil, nil, wrapUnknownErr("create token failed", err)
	}

	jwkKey, err := jwk.FromRaw(rawKey)
	if err != nil {
		return nil, nil, err
	}

	serialized, err := jwt.Sign(token, jwt.WithKey(jwa.HS256, jwkKey))
	if err != nil {
		return nil, nil, wrapUnknownErr("sign token failed", err)
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

func CreateAndSignTempToken(issuer string, ID string, email string, provider string, rawKey []byte, requestID string, expiresAt time.Time) (jwt.Token, []byte, error) {
	token, err := jwt.NewBuilder().Issuer(issuer).IssuedAt(time.Now()).Expiration(expiresAt).Claim("id", ID).Claim("email", email).Claim("provider", provider).Claim("requestId", requestID).Build()
	if err != nil {
		return nil, nil, wrapUnknownErr("create temp token failed", err)
	}

	jwkKey, err := jwk.FromRaw(rawKey)
	if err != nil {
		return nil, nil, err
	}

	serialized, err := jwt.Sign(token, jwt.WithKey(jwa.HS256, jwkKey))
	if err != nil {
		return nil, nil, wrapUnknownErr("sign temp token failed", err)
	}

	return token, serialized, nil
}

func ValidateTempToken(token string, rawKey []byte) (jwt.Token, string, string, string, error) {
	jwkKey, err := jwk.FromRaw(rawKey)
	if err != nil {
		return nil, "", "", "", wrapUnknownErr("create jwk key failed", err)
	}

	parsedToken, err := jwt.ParseString(token, jwt.WithKey(jwa.HS256, jwkKey))
	if err != nil {
		return nil, "", "", "", wrapUnknownErr("parse token failed", err)
	}

	idFromToken, found := parsedToken.Get("id")
	if !found {
		return nil, "", "", "", ErrInvalidTokens
	}

	emailFromToken, found := parsedToken.Get("email")
	if !found {
		return nil, "", "", "", ErrInvalidTokens
	}

	providerFromToken, found := parsedToken.Get("provider")
	if !found {
		return nil, "", "", "", ErrInvalidTokens
	}

	idStr, ok := idFromToken.(string)
	if !ok {
		return nil, "", "", "", ErrInvalidTokens
	}

	emailStr, ok := emailFromToken.(string)
	if !ok {
		return nil, "", "", "", ErrInvalidTokens
	}

	providerStr, ok := providerFromToken.(string)
	if !ok {
		return nil, "", "", "", ErrInvalidTokens
	}

	return parsedToken, idStr, emailStr, providerStr, nil
}
