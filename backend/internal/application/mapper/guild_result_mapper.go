package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func NewGuildResultFromGuild(
	guild *entities.Guild,
	channels []*entities.Channel,
	channelRoles map[string][]string,
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
	channelsMap map[string][]*entities.Channel,
	channelRolesMap map[string][]string,
	rolesMap map[string][]*entities.GuildRole,
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
	channelRoles map[string][]string,
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
	var ver int32 = 0
	return &pb.Guild{
		Ver:             &ver,
		Id:              &guild.ID,
		CreatorId:       &guild.CreatorID,
		GuildCategoryId: guild.GuildCategoryID,
		Name:            &guild.Name,
		Description:     &guild.Description,
		Discoverable:    &guild.Discoverable,
		ChannelCount:    &channelCount,
		MemberCount:     &memberCount,
		CreatedAt:       timestamppb.New(guild.CreatedAt),
		UpdatedAt:       timestamppb.New(guild.UpdatedAt),
		Icon:            guild.IconID,
		Banner:          guild.BannerID,
		Roles:           tempRoles,
		Channels:        tempChannels,
	}

}

func NewGuildCreatedProtoEvent(
	guild *entities.Guild,
	channels []*entities.Channel,
	channelRoles map[string][]string,
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
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_GUILD_UPDATE_EVENT.Enum(),
		Payload: &pb.EventPayload_GuildUpdated{
			GuildUpdated: &pb.GuildUpdated{
				Ver:             &ver,
				Id:              &guild.ID,
				GuildCategoryId: guild.GuildCategoryID,
				Name:            &guild.Name,
				Description:     &guild.Description,
				Discoverable:    &guild.Discoverable,
				ChannelCount:    &channelCount,
				MemberCount:     &memberCount,
				UpdatedAt:       timestamppb.New(guild.UpdatedAt),
				Icon:            guild.IconID,
				Banner:          guild.BannerID,
			},
		},
	}
}

func NewGuildDeletedProtoEvent(ID string) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_GUILD_UPDATE_EVENT.Enum(),
		Payload: &pb.EventPayload_GuildDeleted{
			GuildDeleted: &pb.GuildDeleted{
				Ver: &ver,
				Id:  &ID,
			},
		},
	}
}
