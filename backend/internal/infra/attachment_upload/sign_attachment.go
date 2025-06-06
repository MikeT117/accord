package cloudinary

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"os"
)

func SignAttachment(ID string, timestamp int64) string {
	hash := sha1.New()
	hash.Write(
		[]byte(
			fmt.Sprintf("public_id=%s&timestamp=%d%s",
				ID,
				timestamp,
				os.Getenv("CLOUDINARY_SECRET"),
			),
		),
	)

	return hex.EncodeToString(hash.Sum(nil))
}
