package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type CreateChannelRequest struct {
	ChannelType int8      `json:"channelType"`
	GuildID     *string   `json:"guildID"`
	Name        *string   `json:"name"`
	Topic       *string   `json:"topic"`
	IsPrivate   bool      `json:"isPrivate"`
	RoleIDs     *[]string `json:"roleIds"`
	UserIDs     *[]string `json:"userIds"`
}

func (r *CreateChannelRequest) ToCreateChannelCommand(creatorID string) *command.CreateChannelCommand {
	return &command.CreateChannelCommand{
		ChannelType: r.ChannelType,
		GuildID:     r.GuildID,
		CreatorID:   creatorID,
		Name:        r.Name,
		Topic:       r.Topic,
		RoleIDs:     r.RoleIDs,
		UserIDs:     r.UserIDs,
	}
}
