package command

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/google/uuid"
)

type CreateVoiceStateCommand struct {
	GuildID   *uuid.UUID
	ChannelID uuid.UUID
	UserID    uuid.UUID
}

type CreateVoiceStateCommandResult struct {
	Result *common.VoiceStateResult
}
