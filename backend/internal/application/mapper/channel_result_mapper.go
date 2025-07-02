package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func NewChannelResultFromChannel(channel *entities.Channel, roleIDs []string, users []*entities.User) *common.ChannelResult {
	tempUsers := make([]*common.UserResult, len(users))

	if len(tempUsers) != 0 {
		for i := 0; i < len(users); i++ {
			tempUsers[i] = NewUserResultFromUser(users[i])
		}
	}

	return &common.ChannelResult{
		ID:          channel.ID,
		CreatorID:   channel.CreatorID,
		GuildID:     channel.GuildID,
		ParentID:    channel.ParentID,
		Name:        channel.Name,
		Topic:       channel.Topic,
		ChannelType: channel.ChannelType,
		CreatedAt:   channel.CreatedAt,
		UpdatedAt:   channel.UpdatedAt,
		Users:       tempUsers,
		RoleIDs:     roleIDs,
	}
}

func NewChannelListResultFromChannel(channels []*entities.Channel, roleIDs map[string][]string, users map[string][]*entities.User) []*common.ChannelResult {
	tempChannels := make([]*common.ChannelResult, len(channels))

	for i := 0; i < len(channels); i++ {
		tempChannels = append(tempChannels, NewChannelResultFromChannel(channels[i], roleIDs[channels[i].ID], users[channels[i].ID]))
	}

	return tempChannels
}

func NewChannelProtoResultFromChannel(channel *entities.Channel, roleIDs []string, users []*entities.User) *pb.Channel {
	tempUsers := make([]*pb.User, len(users))

	if len(tempUsers) != 0 {
		for i := 0; i < len(users); i++ {
			tempUsers[i] = NewUserProtoResultFromUser(users[i])
		}
	}

	var ver int32 = 0
	channelType := int32(channel.ChannelType)
	return &pb.Channel{
		Ver:         &ver,
		Id:          &channel.ID,
		CreatorId:   &channel.CreatorID,
		GuildId:     channel.GuildID,
		ParentId:    channel.ParentID,
		Name:        channel.Name,
		Topic:       channel.Topic,
		ChannelType: &channelType,
		CreatedAt:   timestamppb.New(channel.CreatedAt),
		UpdatedAt:   timestamppb.New(channel.UpdatedAt),
		Users:       tempUsers,
		RoleIds:     roleIDs,
	}

}

func NewChannelCreatedProtoEvent(channel *entities.Channel, roleIDs []string, users []*entities.User) *pb.EventPayload {
	tempUsers := make([]*pb.User, len(users))

	if len(tempUsers) != 0 {
		for i := 0; i < len(users); i++ {
			tempUsers[i] = NewUserProtoResultFromUser(users[i])
		}
	}

	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_CHANNEL_CREATE_EVENT.Enum(),
		Payload: &pb.EventPayload_ChannelCreated{
			ChannelCreated: NewChannelProtoResultFromChannel(channel, roleIDs, users),
		},
	}
}

func NewChannelUpdatedProtoEvent(channel *entities.Channel) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_CHANNEL_DELETE_EVENT.Enum(),
		Payload: &pb.EventPayload_ChannelUpdated{
			ChannelUpdated: &pb.ChannelUpdated{
				Ver:       &ver,
				Id:        &channel.ID,
				GuildId:   channel.GuildID,
				ParentId:  channel.ParentID,
				Name:      channel.Name,
				Topic:     channel.Topic,
				UpdatedAt: timestamppb.New(channel.UpdatedAt),
			},
		},
	}
}

func NewChannelDeletedProtoEvent(ID string, guildID *string) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_CHANNEL_DELETE_EVENT.Enum(),
		Payload: &pb.EventPayload_ChannelDeleted{
			ChannelDeleted: &pb.ChannelDeleted{
				Ver:     &ver,
				Id:      &ID,
				GuildId: guildID,
			},
		},
	}
}
