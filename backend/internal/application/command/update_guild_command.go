package command

type UpdateGuildCommand struct {
	ID              string
	GuildCategoryID *string
	Name            string
	Description     string
	Discoverable    bool
	IconID          *string
	BannerID        *string
	RequestorID     string
}
