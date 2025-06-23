package entities

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/domain"
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
		return domain.NewDomainValidationError("id must not be empty")
	}
	if strings.Trim(a.ChannelID, " ") == "" {
		return domain.NewDomainValidationError("channel id must not be empty")
	}
	if strings.Trim(a.UserID, " ") == "" {
		return domain.NewDomainValidationError("user id id must not be empty")
	}
	if a.GuildID != nil && strings.Trim(*a.GuildID, " ") == "" {
		return domain.NewDomainValidationError("guild id must not be empty")
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

func (v *VoiceState) IsOwner(userID string) bool {
	return v.UserID == userID
}

func (v *VoiceState) UpdateSelfMute(selfMute bool) error {
	v.SelfMute = selfMute
	return v.validate()
}
func (v *VoiceState) UpdateSelfDeaf(selfDeaf bool) error {
	v.SelfDeaf = selfDeaf
	return v.validate()
}
