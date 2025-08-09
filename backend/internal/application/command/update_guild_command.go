package command

import "github.com/google/uuid"

type UpdateGuildCommand struct {
	ID              uuid.UUID
	GuildCategoryID *uuid.UUID
	Name            string
	Description     string
	Discoverable    bool
	IconID          *uuid.UUID
	BannerID        *uuid.UUID
	RequestorID     uuid.UUID
}
