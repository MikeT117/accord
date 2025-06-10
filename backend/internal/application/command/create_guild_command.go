package command

type CreateGuildCommand struct {
	CreatorID    string
	Name         string
	Description  string
	Discoverable bool
	IconID       *string
	BannerID     *string
}
