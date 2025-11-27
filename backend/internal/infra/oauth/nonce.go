package oauth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"strconv"
	"strings"
	"time"
)

func (o *OAuth) generateNonce() (string, error) {
	timestamp := strconv.FormatInt(time.Now().UTC().Unix(), 10)

	hash := hmac.New(sha256.New, []byte(o.nonceKey))
	if _, err := hash.Write([]byte(timestamp)); err != nil {
		return "", err
	}

	return timestamp + "." + hex.EncodeToString(hash.Sum(nil)), nil
}

func (o *OAuth) ValidateNonce(nonce string) error {
	splitNonce := strings.Split(nonce, ".")
	if len(splitNonce) < 2 {
		return ErrInvalidNonce
	}

	nonceHash, err := hex.DecodeString(splitNonce[1])
	if err != nil {
		return ErrInvalidNonce
	}

	nonceTimestampInt, err := strconv.ParseInt(splitNonce[0], 10, 64)
	if err != nil {
		return ErrInvalidNonce
	}

	hash := hmac.New(sha256.New, []byte(o.nonceKey))
	if _, err := hash.Write([]byte(splitNonce[0])); err != nil {
		return ErrInvalidNonce
	}

	if !hmac.Equal(hash.Sum(nil), nonceHash) {
		return ErrInvalidNonce
	}

	if time.Since(time.Unix(nonceTimestampInt, 0)) > 15*time.Second {
		return ErrInvalidNonce
	}

	return nil
}
