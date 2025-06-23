package command

type UpdateVoiceStateCommand struct {
	ID       string
	SelfDeaf bool
	SelfMute bool
}
