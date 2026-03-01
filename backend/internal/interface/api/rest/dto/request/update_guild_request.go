package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type UpdateGuildRequest struct {
	ID              uuid.UUID  `param:"guildID"`
	GuildCategoryID *uuid.UUID `json:"guildCategoryId"`
	Name            string     `json:"name"`
	Description     string     `json:"description"`
	Discoverable    bool       `json:"discoverable"`
	IconID          *uuid.UUID `json:"iconId"`
	BannerID        *uuid.UUID `json:"bannerId"`
}

func (r *UpdateGuildRequest) ToUpdateGuildCommand(requestorID uuid.UUID) (*command.UpdateGuildCommand, error) {

	if strings.Trim(r.Name, " ") == "" || len(strings.Trim(r.Name, " ")) < 1 || len(strings.Trim(r.Name, " ")) > 32 {
		return nil, NewRequestValidationError("invalid name")
	}

	if len(r.Description) > 300 {
		return nil, NewRequestValidationError("description length invalid")
	}

	return &command.UpdateGuildCommand{
		ID:              r.ID,
		GuildCategoryID: r.GuildCategoryID,
		Name:            r.Name,
		Description:     r.Description,
		Discoverable:    r.Discoverable,
		IconID:          r.IconID,
		BannerID:        r.BannerID,
		RequestorID:     requestorID,
	}, nil
}
