package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	pointer "github.com/MikeT117/accord/backend/internal/ptr"
	"github.com/google/uuid"
)

func NewChannelResultFromChannel(channel *entities.Channel, roleIDs []uuid.UUID, users []*entities.User) *common.ChannelResult {
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

func NewChannelListResultFromChannel(channels []*entities.Channel, roleIDs map[uuid.UUID][]uuid.UUID, users map[uuid.UUID][]*entities.User) []*common.ChannelResult {
	tempChannels := make([]*common.ChannelResult, len(channels))

	for i := 0; i < len(channels); i++ {
		tempChannels = append(tempChannels, NewChannelResultFromChannel(channels[i], roleIDs[channels[i].ID], users[channels[i].ID]))
	}

	return tempChannels
}

func NewChannelProtoResultFromChannel(channel *entities.Channel, roleIDs []uuid.UUID, users []*entities.User) *pb.Channel {
	version := new(int32(0))
	timestamp := new(channel.UpdatedAt.Unix())
	channelType := new(int32(channel.ChannelType))

	if !channel.IsGuildChannel() {
		tempUsers := make([]*pb.User, len(users))
		for i := 0; i < len(users); i++ {
			tempUsers[i] = NewUserProtoResultFromUser(users[i])
		}

		return &pb.Channel{
			Ver:         new(int32(0)),
			Id:          pointer.UUIDToStringPtr(channel.ID),
			CreatorId:   pointer.UUIDToStringPtr(channel.CreatorID),
			GuildId:     pointer.UUIDPtrToStringPtr(channel.GuildID),
			Name:        channel.Name,
			ChannelType: channelType,
			CreatedAt:   timestamp,
			UpdatedAt:   timestamp,
			Users:       tempUsers,
		}
	}

	var roleIDstrs []string
	for i := 0; i < len(roleIDs); i++ {
		roleIDstrs = append(roleIDstrs, roleIDs[i].String())
	}

	if !channel.IsGuildCategoryChannel() {
		return &pb.Channel{
			Ver:         version,
			Id:          pointer.UUIDToStringPtr(channel.ID),
			CreatorId:   pointer.UUIDToStringPtr(channel.CreatorID),
			GuildId:     pointer.UUIDPtrToStringPtr(channel.GuildID),
			ParentId:    pointer.UUIDPtrToStringPtr(channel.ParentID),
			Name:        channel.Name,
			Topic:       channel.Topic,
			ChannelType: channelType,
			CreatedAt:   timestamp,
			UpdatedAt:   timestamp,
			RoleIds:     roleIDstrs,
		}
	}

	return &pb.Channel{
		Ver:         version,
		Id:          pointer.UUIDToStringPtr(channel.ID),
		CreatorId:   pointer.UUIDToStringPtr(channel.CreatorID),
		GuildId:     pointer.UUIDPtrToStringPtr(channel.GuildID),
		Name:        channel.Name,
		ChannelType: channelType,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
		RoleIds:     roleIDstrs,
	}

}

func NewChannelListProtoResultFromChannel(channels []*entities.Channel, roleIDs map[uuid.UUID][]uuid.UUID, users map[uuid.UUID][]*entities.User) []*pb.Channel {
	tempChannels := make([]*pb.Channel, len(channels))

	for i := 0; i < len(tempChannels); i++ {
		tempChannels[i] = NewChannelProtoResultFromChannel(channels[i], roleIDs[channels[i].ID], users[channels[i].ID])
	}

	return tempChannels
}

func NewChannelCreatedProtoEvent(channel *entities.Channel, roleIDs []uuid.UUID, users []*entities.User) *pb.EventPayload {
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
	updatedAt := channel.UpdatedAt.Unix()
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_CHANNEL_UPDATE_EVENT.Enum(),
		Payload: &pb.EventPayload_ChannelUpdated{
			ChannelUpdated: &pb.ChannelUpdated{
				Ver:       &ver,
				Id:        pointer.UUIDToStringPtr(channel.ID),
				GuildId:   pointer.UUIDPtrToStringPtr(channel.GuildID),
				ParentId:  pointer.UUIDPtrToStringPtr(channel.ParentID),
				Name:      channel.Name,
				Topic:     channel.Topic,
				UpdatedAt: &updatedAt,
			},
		},
	}
}

func NewChannelDeletedProtoEvent(ID uuid.UUID, guildID *uuid.UUID) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_CHANNEL_DELETE_EVENT.Enum(),
		Payload: &pb.EventPayload_ChannelDeleted{
			ChannelDeleted: &pb.ChannelDeleted{
				Ver:     &ver,
				Id:      pointer.UUIDToStringPtr(ID),
				GuildId: pointer.UUIDPtrToStringPtr(guildID),
			},
		},
	}
}
