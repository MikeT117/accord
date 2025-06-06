package authentication

import (
	"errors"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v2/jwa"
	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"
)

func CreateAndSignToken(id string, rawKey []byte, requestId string, expiresAt time.Time) (jwt.Token, []byte, error) {
	token, err := jwt.NewBuilder().Issuer(os.Getenv("JWT_ISSUER")).IssuedAt(time.Now()).Expiration(expiresAt).Claim("id", id).Claim("requestId", requestId).Build()

	if err != nil {
		return nil, []byte{}, err
	}

	jwkKey, err := jwk.FromRaw(rawKey)

	if err != nil {
		return nil, []byte{}, err
	}

	serialized, err := jwt.Sign(token, jwt.WithKey(jwa.HS256, jwkKey))

	if err != nil {
		return nil, []byte{}, err
	}

	return token, serialized, nil

}

func ValidateToken(token string, rawKey []byte) (jwt.Token, uuid.UUID, error) {

	jwkKey, err := jwk.FromRaw(rawKey)

	if err != nil {
		return nil, uuid.UUID{}, err
	}

	parsedToken, err := jwt.ParseString(token, jwt.WithKey(jwa.HS256, jwkKey))

	if err != nil {
		return nil, uuid.UUID{}, err
	}

	idFromToken, found := parsedToken.Get("id")

	if !found {
		return nil, uuid.UUID{}, errors.New("INVALID_TOKENS")
	}

	id, err := uuid.Parse(idFromToken.(string))

	if err != nil {
		return nil, uuid.UUID{}, err
	}

	return parsedToken, id, nil

}
