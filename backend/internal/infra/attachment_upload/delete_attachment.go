package cloudinary

import (
	"errors"
	"fmt"
	"net/http"
	"os"
)

func DeleteAttachment(ID string, signature string, timestamp int64) error {
	response, err := http.Post(
		fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/destroy?api_key=%s&signature=%s&timestamp=%d&public_id=%s",
			os.Getenv("CLOUDINARY_ENVIRONMENT"),
			os.Getenv("CLOUDINARY_API_KEY"),
			signature,
			timestamp,
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
