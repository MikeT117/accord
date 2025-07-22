package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type CreateGuildRequest struct {
	Name   string  `json:"name"`
	IconID *string `json:"iconId"`
}

func (r *CreateGuildRequest) ToCreateGuildCommand(creatorID string) *command.CreateGuildCommand {
	return &command.CreateGuildCommand{
		CreatorID: creatorID,
		Name:      r.Name,
		IconID:    r.IconID,
	}
}
