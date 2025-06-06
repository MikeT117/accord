package entities

import (
	"errors"
	"strings"
)

type VoiceState struct {
	SelfMute  bool
	SelfDeaf  bool
	ChannelID string
	UserID    string
	GuildID   *string
}

func (a *VoiceState) validate() error {
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

	return &VoiceState{
		SelfMute:  false,
		SelfDeaf:  false,
		ChannelID: channelID,
		UserID:    userID,
		GuildID:   guildID,
	}, nil

}
