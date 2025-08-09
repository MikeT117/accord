package mapper

import (
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
) *common.GuildResult {
	tempChannels := make([]*common.ChannelResult, len(channels))
	tempRoles := make([]*common.GuildRoleResult, len(roles))

	if len(channels) != 0 {
		for i := 0; i < len(channels); i++ {
			tempChannels[i] = NewChannelResultFromChannel(
				channels[i],
				channelRoles[channels[i].ID],
				nil,
			)
		}
	}

	if len(roles) != 0 {
		for i := 0; i < len(roles); i++ {
			tempRoles[i] = NewGuildRoleResultFromGuildRole(roles[i])
		}
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
	}
}

func NewGuildListResultFromGuild(
	guilds []*entities.Guild,
	channelsMap map[uuid.UUID][]*entities.Channel,
	channelRolesMap map[uuid.UUID][]uuid.UUID,
	rolesMap map[uuid.UUID][]*entities.GuildRole,
) []*common.GuildResult {
	guildsResult := make([]*common.GuildResult, len(guilds))

	for i := 0; i < len(guilds); i++ {
		guildsResult[i] = NewGuildResultFromGuild(
			guilds[i],
			channelsMap[guilds[i].ID],
			channelRolesMap,
			rolesMap[guilds[i].ID],
		)
	}

	return guildsResult
}

func NewGuildProtoResultFromGuild(
	guild *entities.Guild,
	channels []*entities.Channel,
	channelRoles map[uuid.UUID][]uuid.UUID,
	roles []*entities.GuildRole,
) *pb.Guild {
	tempChannels := make([]*pb.Channel, len(channels))
	tempRoles := make([]*pb.GuildRole, len(roles))

	if len(channels) != 0 {
		for i := 0; i < len(channels); i++ {
			tempChannels[i] = NewChannelProtoResultFromChannel(
				channels[i],
				channelRoles[channels[i].ID],
				nil,
			)
		}
	}

	if len(roles) != 0 {
		for i := 0; i < len(roles); i++ {
			tempRoles[i] = NewGuildRoleProtoResultFromGuildRole(roles[i])
		}
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
	}
}

func NewGuildProtoListResultFromGuild(
	guilds []*entities.Guild,
	channelsMap map[uuid.UUID][]*entities.Channel,
	channelRolesMap map[uuid.UUID][]uuid.UUID,
	rolesMap map[uuid.UUID][]*entities.GuildRole,
) []*pb.Guild {
	guildsResult := make([]*pb.Guild, len(guilds))

	for i := 0; i < len(guilds); i++ {
		guildsResult[i] = NewGuildProtoResultFromGuild(
			guilds[i],
			channelsMap[guilds[i].ID],
			channelRolesMap,
			rolesMap[guilds[i].ID],
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
			GuildCreated: NewGuildProtoResultFromGuild(guild, channels, channelRoles, roles),
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
