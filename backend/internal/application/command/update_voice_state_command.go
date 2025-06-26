package command

type UpdateVoiceStateCommand struct {
	ID          string
	GuildID     string
	RequestorID string
	SelfDeaf    bool
	SelfMute    bool
}
