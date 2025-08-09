package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	pointer "github.com/MikeT117/accord/backend/internal/ptr"
	"github.com/google/uuid"
)

func NewChannelMessageResultFromChannelMessage(channelMessage *entities.ChannelMessage, user *entities.User, guildMember *entities.GuildMember, attachments []*entities.Attachment) *common.ChannelMessageResult {

	return &common.ChannelMessageResult{
		ID:          channelMessage.ID,
		Content:     channelMessage.Content,
		Pinned:      channelMessage.Pinned,
		Flag:        channelMessage.Flag,
		AuthorID:    channelMessage.AuthorID,
		ChannelID:   channelMessage.ChannelID,
		CreatedAt:   channelMessage.CreatedAt,
		UpdatedAt:   channelMessage.UpdatedAt,
		Author:      NewChannelMessageAuthorResultFromUserGuildMember(user, guildMember),
		Attachments: NewAttachmentListResultFromAttachments(attachments),
	}
}

func NewChannelMessageListResultFromChannelMessage(channelMessages []*entities.ChannelMessage, user map[uuid.UUID]*entities.User, guildmembers map[uuid.UUID]*entities.GuildMember, attachments map[uuid.UUID][]*entities.Attachment) []*common.ChannelMessageResult {

	channelMessageResult := make([]*common.ChannelMessageResult, len(channelMessages))

	for i := 0; i < len(channelMessages); i++ {
		channelMessageResult[i] = NewChannelMessageResultFromChannelMessage(
			channelMessages[i],
			user[channelMessages[i].AuthorID],
			guildmembers[channelMessages[i].AuthorID],
			attachments[channelMessages[i].ID],
		)
	}

	return channelMessageResult
}

func NewChannelMessageProtoResultFromChannelMessage(channelMessage *entities.ChannelMessage, user *entities.User, guildMember *entities.GuildMember, attachments []*entities.Attachment) *pb.ChannelMessage {
	var ver int32 = 0
	var flag int32 = int32(channelMessage.Flag)
	createdAt := channelMessage.CreatedAt.Unix()
	updatedAt := channelMessage.UpdatedAt.Unix()
	return &pb.ChannelMessage{
		Ver:         &ver,
		Id:          pointer.UUIDToStringPtr(channelMessage.ID),
		Content:     &channelMessage.Content,
		Pinned:      &channelMessage.Pinned,
		Flag:        &flag,
		AuthorId:    pointer.UUIDToStringPtr(channelMessage.AuthorID),
		ChannelId:   pointer.UUIDToStringPtr(channelMessage.ChannelID),
		CreatedAt:   &createdAt,
		UpdatedAt:   &updatedAt,
		Author:      NewChannelMessageAuthorProtoResultFromUserGuildMember(user, guildMember),
		Attachments: NewAttachmentListProtoResultFromAttachments(attachments),
	}
}

func NewChannelMessageCreatedProtoEvent(channelMessage *entities.ChannelMessage, user *entities.User, guildMember *entities.GuildMember, attachments []*entities.Attachment) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_CHANNEL_MESSAGE_CREATE_EVENT.Enum(),
		Payload: &pb.EventPayload_ChannelMessageCreated{
			ChannelMessageCreated: NewChannelMessageProtoResultFromChannelMessage(channelMessage, user, guildMember, attachments),
		},
	}
}

func NewChannelMessageUpdatedProtoEvent(channelMessage *entities.ChannelMessage, attachments []*entities.Attachment) *pb.EventPayload {
	var ver int32 = 0
	var flag int32 = int32(channelMessage.Flag)

	updatedAt := channelMessage.UpdatedAt.Unix()
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_CHANNEL_MESSAGE_UPDATE_EVENT.Enum(),
		Payload: &pb.EventPayload_ChannelMessageUpdated{
			ChannelMessageUpdated: &pb.ChannelMessageUpdated{
				Ver:         &ver,
				Id:          pointer.UUIDToStringPtr(channelMessage.ID),
				Content:     &channelMessage.Content,
				Pinned:      &channelMessage.Pinned,
				Flag:        &flag,
				ChannelId:   pointer.UUIDToStringPtr(channelMessage.ChannelID),
				UpdatedAt:   &updatedAt,
				Attachments: NewAttachmentListProtoResultFromAttachments(attachments),
			},
		},
	}
}

func NewChannelMessageDeletedProtoEvent(ID uuid.UUID, channelID uuid.UUID) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_CHANNEL_MESSAGE_DELETE_EVENT.Enum(),
		Payload: &pb.EventPayload_ChannelMessageDeleted{
			ChannelMessageDeleted: &pb.ChannelMessageDeleted{
				Ver:       &ver,
				Id:        pointer.UUIDToStringPtr(ID),
				ChannelId: pointer.UUIDToStringPtr(channelID),
			},
		},
	}
}
