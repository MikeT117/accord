package command

type UpdateUserCommand struct {
	ID          string
	DisplayName string
	PublicFlags int8
	AvatarID    *string
	BannerID    *string
}
