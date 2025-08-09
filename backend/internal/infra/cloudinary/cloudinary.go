package cloudinary

import (
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"

	"github.com/google/uuid"
)

type CloudinaryUpload struct {
	cloudinaryEnvironment string
	cloudinaryAPIKey      string
	cloudinarySecret      string
}

func NewCloudinaryUpload(environment string, APIKey string, secret string) *CloudinaryUpload {
	return &CloudinaryUpload{
		cloudinaryEnvironment: environment,
		cloudinaryAPIKey:      APIKey,
		cloudinarySecret:      secret,
	}
}

func (c *CloudinaryUpload) DeleteAttachment(ID uuid.UUID, signature string, unixTimestamp int64) error {
	response, err := http.Post(
		fmt.Sprintf(
			"https://api.cloudinary.com/v1_1/%s/image/destroy?api_key=%s&signature=%s&timestamp=%d&public_id=%s",
			c.cloudinaryEnvironment,
			c.cloudinaryAPIKey,
			signature,
			unixTimestamp,
			ID,
		),
		"application/json",
		nil,
	)

	if err != nil {
		return err
	}

	if response.StatusCode != 200 {
		return errors.New("reponse status is not 200")
	}

	return nil
}

func (c *CloudinaryUpload) SignAttachment(ID uuid.UUID, unixTimestamp int64) string {
	hash := sha1.New()
	hash.Write(
		fmt.Appendf(nil, "public_id=%s&timestamp=%d%s",
			ID,
			unixTimestamp,
			c.cloudinarySecret,
		),
	)

	return hex.EncodeToString(hash.Sum(nil))
}
