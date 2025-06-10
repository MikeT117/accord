package entities

import (
	"errors"
	"strings"

	"github.com/google/uuid"
)

type VoiceState struct {
	ID        string
	SelfMute  bool
	SelfDeaf  bool
	ChannelID string
	UserID    string
	GuildID   *string
}

func (a *VoiceState) validate() error {
	if strings.Trim(a.ID, " ") == "" {
		return errors.New("id must not be empty")
	}
	if strings.Trim(a.ChannelID, " ") == "" {
		return errors.New("channel id must not be empty")
	}
	if strings.Trim(a.UserID, " ") == "" {
		return errors.New("user id id must not be empty")
	}
	if a.GuildID != nil && strings.Trim(*a.GuildID, " ") == "" {
		return errors.New("guild id must not be empty")
	}
	return nil
}

func NewVoiceState(userID string, channelID string, guildID *string) (*VoiceState, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	voiceState := &VoiceState{
		ID:        ID.String(),
		SelfMute:  false,
		SelfDeaf:  false,
		ChannelID: channelID,
		UserID:    userID,
		GuildID:   guildID,
	}

	if err := voiceState.validate(); err != nil {
		return nil, err
	}

	return voiceState, nil
}

func (v *VoiceState) UpdateselfMute(selfMute bool) error {
	v.SelfMute = selfMute
	return v.validate()
}
func (v *VoiceState) UpdateselfDeaf(selfDeaf bool) error {
	v.SelfDeaf = selfDeaf
	return v.validate()
}
