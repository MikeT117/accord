package common

type VoiceStateResult struct {
	ID        string
	SelfMute  bool
	SelfDeaf  bool
	ChannelID string
	UserID    string
	GuildID   *string
	User      *UserResult
}
