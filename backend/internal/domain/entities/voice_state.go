package entities

import (
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type VoiceState struct {
	ID        uuid.UUID
	SelfMute  bool
	SelfDeaf  bool
	ChannelID uuid.UUID
	GuildID   *uuid.UUID
}

func (a *VoiceState) validate() error {
	if a.ID == uuid.Nil {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if a.ChannelID == uuid.Nil {
		return domain.NewDomainValidationError("channel id must not be empty")
	}
	if a.GuildID != nil && *a.GuildID == uuid.Nil {
		return domain.NewDomainValidationError("guild id must not be empty")
	}
	return nil
}

func NewVoiceState(userID uuid.UUID, channelID uuid.UUID, guildID *uuid.UUID) (*VoiceState, error) {
	voiceState := &VoiceState{
		ID:        userID,
		SelfMute:  false,
		SelfDeaf:  false,
		ChannelID: channelID,
		GuildID:   guildID,
	}

	if err := voiceState.validate(); err != nil {
		return nil, err
	}

	return voiceState, nil
}

func (v *VoiceState) IsOwner(userID uuid.UUID) bool {
	return v.ID == userID
}

func (v *VoiceState) UpdateSelfMute(selfMute bool) error {
	v.SelfMute = selfMute
	return v.validate()
}
func (v *VoiceState) UpdateSelfDeaf(selfDeaf bool) error {
	v.SelfDeaf = selfDeaf
	return v.validate()
}
