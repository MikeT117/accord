package common

type UserResult struct {
	ID          string
	AccountID   string
	Username    string
	DisplayName string
	Email       string
	PublicFlags int8
	AvatarID    *string
	BannerID    *string
}
