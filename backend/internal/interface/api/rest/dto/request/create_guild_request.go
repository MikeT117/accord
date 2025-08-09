package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateGuildRequest struct {
	Name   string     `json:"name"`
	IconID *uuid.UUID `json:"iconId"`
}

func (r *CreateGuildRequest) ToCreateGuildCommand(creatorID uuid.UUID) *command.CreateGuildCommand {
	return &command.CreateGuildCommand{
		CreatorID: creatorID,
		Name:      r.Name,
		IconID:    r.IconID,
	}
}
