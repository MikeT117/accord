package response

type AttachmentSignResponse struct {
	ID        string `json:"id"`
	Signature string `json:"signature"`
	Timestamp int64  `json:"timestamp"`
}
