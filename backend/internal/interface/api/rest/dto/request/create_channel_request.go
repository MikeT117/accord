package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type CreateChannelRequest struct {
	ChannelType int8      `json:"channelType"`
	GuildID     *string   `json:"guildID"`
	Name        *string   `json:"name"`
	Topic       *string   `json:"topic"`
	RoleIDs     *[]string `json:"roleIds"`
	UserIDs     *[]string `json:"userIds"`
}

func (r *CreateChannelRequest) ToCreateChannelCommand(requestorID string) (*command.CreateChannelCommand, error) {
	if r.UserIDs != nil && len(*r.UserIDs) == 0 {
		return nil, NewRequestValidationError("invalid number of users")
	}

	if r.GuildID != nil && *r.GuildID == "" {
		return nil, NewRequestValidationError("guild id cannot be empty")
	}

	if r.GuildID != nil && (r.Name == nil || *r.Name == "") {
		return nil, NewRequestValidationError("name cannot be empty for a guild channel")
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
