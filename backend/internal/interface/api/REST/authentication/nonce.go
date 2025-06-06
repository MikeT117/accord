package authentication

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"os"
	"strconv"
	"strings"
	"time"
)

func getNonceKey() string {
	key := os.Getenv("OAUTH_STATE_SECRET")
	if key == "" {
		panic("INVALID OAUTH_STATE_SECRET")
	}

	return key
}

func GenerateNonce() string {
	timestamp := strconv.FormatInt(time.Now().UTC().Unix(), 10)

	key := getNonceKey()
	hash := hmac.New(sha256.New, []byte(key))
	hash.Write([]byte(timestamp))

	return timestamp + "." + hex.EncodeToString(hash.Sum(nil))
}

func ValidateNonce(nonce string) bool {
	splitNonce := strings.Split(nonce, ".")
	if len(splitNonce) < 2 {
		return false
	}

	nonceHash, err := hex.DecodeString(splitNonce[1])
	if err != nil {
		return false
	}

	nonceTimestampInt, err := strconv.ParseInt(splitNonce[0], 10, 64)
	if err != nil {
		return false
	}

	key := getNonceKey()
	hash := hmac.New(sha256.New, []byte(key))
	hash.Write([]byte(splitNonce[0]))

	if !hmac.Equal(hash.Sum(nil), nonceHash) {
		return false
	}

	return time.Since(time.Unix(nonceTimestampInt, 0)) < 30*time.Second
}
