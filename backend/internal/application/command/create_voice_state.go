package command

type CreateVoiceStateCommand struct {
	GuildID   *string
	ChannelID string
	UserID    string
}
