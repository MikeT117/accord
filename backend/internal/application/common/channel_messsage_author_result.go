package common

type ChannelMessageAuthorResult struct {
	ID          string
	Username    string
	DisplayName string
	PublicFlags int8
	Avatar      *string
	Banner      *string
}
