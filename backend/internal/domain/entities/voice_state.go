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
	UserID    uuid.UUID
	GuildID   *uuid.UUID
}

func (a *VoiceState) validate() error {
	if a.ID == uuid.Nil {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if a.ChannelID == uuid.Nil {
		return domain.NewDomainValidationError("channel id must not be empty")
	}
	if a.UserID == uuid.Nil {
		return domain.NewDomainValidationError("user id id must not be empty")
	}
	if a.GuildID != nil && *a.GuildID == uuid.Nil {
		return domain.NewDomainValidationError("guild id must not be empty")
	}
	return nil
}

func NewVoiceState(userID uuid.UUID, channelID uuid.UUID, guildID *uuid.UUID) (*VoiceState, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	voiceState := &VoiceState{
		ID:        ID,
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

func (v *VoiceState) IsOwner(userID uuid.UUID) bool {
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
