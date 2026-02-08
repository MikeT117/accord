package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	pointer "github.com/MikeT117/accord/backend/internal/ptr"
	"github.com/google/uuid"
)

func NewVoiceStateResultFromVoiceState(voiceState *entities.VoiceState, guildMember *entities.GuildMember, user *entities.User) *common.VoiceStateResult {
	if voiceState == nil {
		return nil
	}

	return &common.VoiceStateResult{
		ID:        voiceState.ID,
		SelfMute:  voiceState.SelfMute,
		SelfDeaf:  voiceState.SelfDeaf,
		ChannelID: voiceState.ChannelID,
		GuildID:   voiceState.GuildID,
		User:      NewVoiceStateGuildMemberUserResultFromUserGuildMember(user, guildMember),
	}

}

func NewVoiceStateListResultFromVoiceState(voiceStates []*entities.VoiceState, guildMembersMap map[uuid.UUID]*entities.GuildMember, usersMap map[uuid.UUID]*entities.User) []*common.VoiceStateResult {

	voiceStateResults := make([]*common.VoiceStateResult, len(voiceStates))

	for i := 0; i < len(voiceStates); i++ {
		voiceStateResults[i] = NewVoiceStateResultFromVoiceState(voiceStates[i], guildMembersMap[voiceStates[i].ID], usersMap[voiceStates[i].ID])
	}

	return voiceStateResults
}

func NewVoiceStateProtoResultFromVoiceState(voiceState *entities.VoiceState, user *entities.User, guildMember *entities.GuildMember) *pb.VoiceState {
	return &pb.VoiceState{
		Id:        pointer.UUIDToStringPtr(voiceState.ID),
		GuildId:   pointer.UUIDPtrToStringPtr(voiceState.GuildID),
		ChannelId: pointer.UUIDToStringPtr(voiceState.ChannelID),
		User:      NewVoiceStateUserProtoResultFromUserGuildMember(user, guildMember),
		SelfMute:  &voiceState.SelfMute,
		SelfDeaf:  &voiceState.SelfDeaf,
	}

}

func NewVoiceStateCreatedProtoEvent(voiceState *entities.VoiceState, user *entities.User, guildMember *entities.GuildMember) *pb.EventPayload {
	var ver int32 = 0

	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_VOICE_STATE_CREATE_EVENT.Enum(),
		Payload: &pb.EventPayload_VoiceStateCreated{
			VoiceStateCreated: NewVoiceStateProtoResultFromVoiceState(voiceState, user, guildMember),
		},
	}
}

func NewVoiceStateUpdatedProtoEvent(voiceState *entities.VoiceState) *pb.EventPayload {
	var ver int32 = 0

	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_VOICE_STATE_UPDATE_EVENT.Enum(),
		Payload: &pb.EventPayload_VoiceStateUpdated{
			VoiceStateUpdated: &pb.VoiceStateUpdated{
				Ver:       &ver,
				Id:        pointer.UUIDToStringPtr(voiceState.ID),
				GuildId:   pointer.UUIDPtrToStringPtr(voiceState.GuildID),
				ChannelId: pointer.UUIDToStringPtr(voiceState.ChannelID),
				SelfMute:  &voiceState.SelfMute,
				SelfDeaf:  &voiceState.SelfDeaf,
			},
		},
	}
}

func NewVoiceStateDeletedProtoEvent(ID uuid.UUID, guildID uuid.UUID, channelID uuid.UUID) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_VOICE_STATE_DELETE_EVENT.Enum(),
		Payload: &pb.EventPayload_VoiceStateDeleted{
			VoiceStateDeleted: &pb.VoiceStateDeleted{
				Ver:       &ver,
				Id:        pointer.UUIDToStringPtr(ID),
				GuildId:   pointer.UUIDToStringPtr(guildID),
				ChannelId: pointer.UUIDToStringPtr(channelID),
			},
		},
	}
}
