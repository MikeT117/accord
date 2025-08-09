package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

func NewVoiceStateResultFromVoiceState(voiceState *entities.VoiceState, user *entities.User) *common.VoiceStateResult {
	if voiceState == nil {
		return nil
	}

	return &common.VoiceStateResult{
		ID:        voiceState.ID,
		SelfMute:  voiceState.SelfMute,
		SelfDeaf:  voiceState.SelfDeaf,
		ChannelID: voiceState.ChannelID,
		UserID:    voiceState.UserID,
		GuildID:   voiceState.GuildID,
		User:      NewUserResultFromUser(user),
	}

}

func NewVoiceStateListResultFromVoiceState(voiceStates []*entities.VoiceState, usersMap map[uuid.UUID]*entities.User) []*common.VoiceStateResult {

	voiceStateResults := make([]*common.VoiceStateResult, len(voiceStates))

	for i := 0; i < len(voiceStates); i++ {
		voiceStateResults[i] = NewVoiceStateResultFromVoiceState(voiceStates[i], usersMap[voiceStates[i].UserID])
	}

	return voiceStateResults
}
