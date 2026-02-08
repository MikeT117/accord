package mapper

import (
	"log"

	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	pointer "github.com/MikeT117/accord/backend/internal/ptr"
	"github.com/google/uuid"
)

func NewGuildResultFromGuild(
	guild *entities.Guild,
	channels []*entities.Channel,
	channelRoles map[uuid.UUID][]uuid.UUID,
	roles []*entities.GuildRole,
	voiceStates []*entities.VoiceState,
	voiceStateGuildMembers map[uuid.UUID]*entities.GuildMember,
	voiceStateUsers map[uuid.UUID]*entities.User,
) *common.GuildResult {
	tempChannels := make([]*common.ChannelResult, len(channels))
	tempRoles := make([]*common.GuildRoleResult, len(roles))
	tempVoiceStates := make([]*common.VoiceStateResult, len(voiceStates))

	for i := 0; i < len(channels); i++ {
		if channelRoles[channels[i].ID] == nil {
			/*
				This should never happen but we'll guard and log just in case.
			*/

			log.Printf("channel exists with no roles assigned - channel id: %s\n", channels[i].ID)
			continue
		}

		tempChannels[i] = NewChannelResultFromChannel(
			channels[i],
			channelRoles[channels[i].ID],
			nil,
		)
	}

	for i := 0; i < len(roles); i++ {
		tempRoles[i] = NewGuildRoleResultFromGuildRole(roles[i])
	}

	for i := 0; i < len(voiceStates); i++ {
		if voiceStateUsers[voiceStates[i].ID] == nil {
			/*
				This should never happen but we'll guard and log just in case.
			*/

			log.Printf("voice states exists with no associated user - voice state id: %s\n", voiceStates[i].ID)
			continue
		}
		tempVoiceStates[i] = NewVoiceStateResultFromVoiceState(voiceStates[i], voiceStateGuildMembers[voiceStates[i].ID], voiceStateUsers[voiceStates[i].ID])
	}

	return &common.GuildResult{
		ID:              guild.ID,
		CreatorID:       guild.CreatorID,
		GuildCategoryID: guild.GuildCategoryID,
		Name:            guild.Name,
		Description:     guild.Description,
		Discoverable:    guild.Discoverable,
		ChannelCount:    guild.ChannelCount,
		MemberCount:     guild.MemberCount,
		CreatedAt:       guild.CreatedAt,
		UpdatedAt:       guild.UpdatedAt,
		IconID:          guild.IconID,
		BannerID:        guild.BannerID,
		Roles:           tempRoles,
		Channels:        tempChannels,
		VoiceStates:     tempVoiceStates,
	}
}

func NewGuildListResultFromGuild(
	guilds []*entities.Guild,
	channelsMap map[uuid.UUID][]*entities.Channel,
	channelRolesMap map[uuid.UUID][]uuid.UUID,
	rolesMap map[uuid.UUID][]*entities.GuildRole,
	voiceStatesMap map[uuid.UUID][]*entities.VoiceState,
	voiceStateGuildMembers map[uuid.UUID]*entities.GuildMember,
	voiceStateUsers map[uuid.UUID]*entities.User,
) []*common.GuildResult {
	guildsResult := make([]*common.GuildResult, len(guilds))

	for i := 0; i < len(guilds); i++ {
		guildsResult[i] = NewGuildResultFromGuild(
			guilds[i],
			channelsMap[guilds[i].ID],
			channelRolesMap,
			rolesMap[guilds[i].ID],
			voiceStatesMap[guilds[i].ID],
			voiceStateGuildMembers,
			voiceStateUsers,
		)
	}

	return guildsResult
}

func NewGuildProtoResultFromGuild(
	guild *entities.Guild,
	channels []*entities.Channel,
	channelRoles map[uuid.UUID][]uuid.UUID,
	roles []*entities.GuildRole,
	voiceStates []*entities.VoiceState,
	voiceStateGuildMembers map[uuid.UUID]*entities.GuildMember,
	voiceStateUsers map[uuid.UUID]*entities.User,
) *pb.Guild {
	tempChannels := make([]*pb.Channel, len(channels))
	tempRoles := make([]*pb.GuildRole, len(roles))
	tempVoiceStates := make([]*pb.VoiceState, len(voiceStates))

	for i := 0; i < len(channels); i++ {
		tempChannels[i] = NewChannelProtoResultFromChannel(
			channels[i],
			channelRoles[channels[i].ID],
			nil,
		)
	}

	for i := 0; i < len(roles); i++ {
		tempRoles[i] = NewGuildRoleProtoResultFromGuildRole(roles[i])
	}

	for i := 0; i < len(voiceStates); i++ {
		tempVoiceStates[i] = NewVoiceStateProtoResultFromVoiceState(voiceStates[i], voiceStateUsers[voiceStates[i].ID], voiceStateGuildMembers[voiceStates[i].ID])
	}

	channelCount := int32(guild.ChannelCount)
	memberCount := int32(guild.MemberCount)
	createdAt := guild.CreatedAt.Unix()
	updatedAt := guild.UpdatedAt.Unix()

	var ver int32 = 0
	return &pb.Guild{
		Ver:             &ver,
		Id:              pointer.UUIDToStringPtr(guild.ID),
		CreatorId:       pointer.UUIDToStringPtr(guild.CreatorID),
		GuildCategoryId: pointer.UUIDPtrToStringPtr(guild.GuildCategoryID),
		Name:            &guild.Name,
		Description:     &guild.Description,
		Discoverable:    &guild.Discoverable,
		ChannelCount:    &channelCount,
		MemberCount:     &memberCount,
		CreatedAt:       &createdAt,
		UpdatedAt:       &updatedAt,
		Icon:            pointer.UUIDPtrToStringPtr(guild.IconID),
		Banner:          pointer.UUIDPtrToStringPtr(guild.BannerID),
		Roles:           tempRoles,
		Channels:        tempChannels,
		VoiceStates:     tempVoiceStates,
	}
}

func NewGuildProtoListResultFromGuild(
	guilds []*entities.Guild,
	channelsMap map[uuid.UUID][]*entities.Channel,
	channelRolesMap map[uuid.UUID][]uuid.UUID,
	rolesMap map[uuid.UUID][]*entities.GuildRole,
	voiceStates map[uuid.UUID][]*entities.VoiceState,
	voiceStateGuildMembers map[uuid.UUID]map[uuid.UUID]*entities.GuildMember,
	voiceStateUsers map[uuid.UUID]*entities.User,
) []*pb.Guild {
	guildsResult := make([]*pb.Guild, len(guilds))

	for i := 0; i < len(guilds); i++ {
		guildsResult[i] = NewGuildProtoResultFromGuild(
			guilds[i],
			channelsMap[guilds[i].ID],
			channelRolesMap,
			rolesMap[guilds[i].ID],
			voiceStates[guilds[i].ID],
			voiceStateGuildMembers[guilds[i].ID],
			voiceStateUsers,
		)
	}

	return guildsResult
}

func NewGuildCreatedProtoEvent(
	guild *entities.Guild,
	channels []*entities.Channel,
	channelRoles map[uuid.UUID][]uuid.UUID,
	roles []*entities.GuildRole,
) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_GUILD_CREATE_EVENT.Enum(),
		Payload: &pb.EventPayload_GuildCreated{
			GuildCreated: NewGuildProtoResultFromGuild(guild, channels, channelRoles, roles, nil, nil, nil),
		},
	}
}

func NewGuildUpdatedProtoEvent(guild *entities.Guild) *pb.EventPayload {
	channelCount := int32(guild.ChannelCount)
	memberCount := int32(guild.MemberCount)

	updatedAt := guild.UpdatedAt.Unix()

	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_GUILD_UPDATE_EVENT.Enum(),
		Payload: &pb.EventPayload_GuildUpdated{
			GuildUpdated: &pb.GuildUpdated{
				Ver:             &ver,
				Id:              pointer.UUIDToStringPtr(guild.ID),
				GuildCategoryId: pointer.UUIDPtrToStringPtr(guild.GuildCategoryID),
				Name:            &guild.Name,
				Description:     &guild.Description,
				Discoverable:    &guild.Discoverable,
				ChannelCount:    &channelCount,
				MemberCount:     &memberCount,
				UpdatedAt:       &updatedAt,
				Icon:            pointer.UUIDPtrToStringPtr(guild.IconID),
				Banner:          pointer.UUIDPtrToStringPtr(guild.BannerID),
			},
		},
	}
}

func NewGuildDeletedProtoEvent(ID uuid.UUID) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_GUILD_UPDATE_EVENT.Enum(),
		Payload: &pb.EventPayload_GuildDeleted{
			GuildDeleted: &pb.GuildDeleted{
				Ver: &ver,
				Id:  pointer.UUIDToStringPtr(ID),
			},
		},
	}
}
