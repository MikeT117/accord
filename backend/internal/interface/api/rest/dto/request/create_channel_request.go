package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type CreateChannelRequest struct {
	ChannelType int8     `json:"channelType"`
	GuildID     *string  `json:"guildID"`
	IsPrivate   bool     `json:"isPrivate"`
	Name        *string  `json:"name"`
	Topic       *string  `json:"topic"`
	RoleIDs     []string `json:"roleIds"`
	UserIDs     []string `json:"userIds"`
}

func (r *CreateChannelRequest) ToCreateChannelCommand(requestorID string) (*command.CreateChannelCommand, error) {

	if r.ChannelType > entities.GuildCategoryChannel && len(r.UserIDs) == 0 {
		return nil, NewRequestValidationError("a private channel must have users")
	}

	if r.ChannelType < entities.DMChannel && r.GuildID != nil && *r.GuildID == "" {
		return nil, NewRequestValidationError("guild id cannot be empty")
	}

	if r.ChannelType < entities.DMChannel && (r.Name == nil || strings.Trim(*r.Name, " ") == "") {
		return nil, NewRequestValidationError("guild channel must have a valid name")
	}

	return &command.CreateChannelCommand{
		ChannelType: r.ChannelType,
		GuildID:     r.GuildID,
		CreatorID:   requestorID,
		Name:        r.Name,
		Topic:       r.Topic,
		RoleIDs:     r.RoleIDs,
		UserIDs:     r.UserIDs,
	}, nil
}
