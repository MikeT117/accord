package response

type ChannelMessageAuthor struct {
	ID          string  `json:"id"`
	Username    string  `json:"username"`
	DisplayName string  `json:"displayName"`
	PublicFlags int8    `json:"publicFlags"`
	Avatar      *string `json:"avatar"`
	Banner      *string `json:"banner"`
}
