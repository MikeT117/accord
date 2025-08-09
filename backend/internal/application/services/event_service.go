package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"github.com/MikeT117/accord/backend/internal/infra/pubsub"
	pointer "github.com/MikeT117/accord/backend/internal/ptr"
	"github.com/google/uuid"
)

type EventService struct {
	eventPublisher           *pubsub.EventPublisher
	channelMessageRepository repositories.ChannelMessageRepository
	channelRepository        repositories.ChannelRepository
	userRepository           repositories.UserRepository
	guildRepository          repositories.GuildRepository
	guildMemberRepository    repositories.GuildMemberRepository
	attachmentRepository     repositories.AttachmentRepository
	guildRoleRepository      repositories.GuildRoleRepository
	relationshipRepository   repositories.RelationshipRepository
}

func CreateEventService(
	eventPublisher *pubsub.EventPublisher,
	channelMessageRepository repositories.ChannelMessageRepository,
	channelRepository repositories.ChannelRepository,
	userRepository repositories.UserRepository,
	guildRepository repositories.GuildRepository,
	guildMemberRepository repositories.GuildMemberRepository,
	attachmentRepository repositories.AttachmentRepository,
	guildRoleRepository repositories.GuildRoleRepository,
	relationshipRepository repositories.RelationshipRepository,
) interfaces.EventService {
	return &EventService{
		eventPublisher:           eventPublisher,
		channelMessageRepository: channelMessageRepository,
		channelRepository:        channelRepository,
		userRepository:           userRepository,
		guildRepository:          guildRepository,
		guildMemberRepository:    guildMemberRepository,
		attachmentRepository:     attachmentRepository,
		guildRoleRepository:      guildRoleRepository,
		relationshipRepository:   relationshipRepository,
	}
}

func (s *EventService) GuildCreated(ctx context.Context, ID uuid.UUID) error {
	guild, err := s.guildRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	channels, channelIDs, err := s.channelRepository.GetByGuildID(ctx, ID)
	if err != nil {
		return err
	}

	channelRoles, err := s.guildRoleRepository.GetMapRoleIDsByChannelIDs(ctx, channelIDs)
	if err != nil {
		return err
	}

	roles, _, err := s.guildRoleRepository.GetByGuildID(ctx, ID)
	if err != nil {
		return err
	}

	if err := s.eventPublisher.PublishUserEvent(
		[]uuid.UUID{guild.CreatorID},
		mapper.NewGuildCreatedProtoEvent(guild, channels, channelRoles, roles),
	); err != nil {
		return err
	}

	for _, role := range roles {
		if err := s.UserRoleAssociated(ctx, guild.CreatorID, role.ID); err != nil {
			return err
		}
	}

	return nil
}

func (s *EventService) GuildUpdated(ctx context.Context, ID uuid.UUID) error {
	guild, err := s.guildRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, guild.ID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishRoleEvent(
		[]uuid.UUID{roleID},
		mapper.NewGuildUpdatedProtoEvent(guild),
	)
}

func (s *EventService) GuildDeleted(ctx context.Context, ID uuid.UUID, roleID uuid.UUID) error {
	return s.eventPublisher.PublishRoleEvent([]uuid.UUID{roleID}, mapper.NewGuildDeletedProtoEvent(ID))
}

func (s *EventService) GuildRoleCreated(ctx context.Context, ID uuid.UUID) error {
	role, err := s.guildRoleRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, role.GuildID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishRoleEvent([]uuid.UUID{roleID}, mapper.NewGuildRoleCreatedProtoEvent(role))
}

func (s *EventService) GuildRoleUpdated(ctx context.Context, ID uuid.UUID) error {
	role, err := s.guildRoleRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, role.GuildID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishRoleEvent([]uuid.UUID{roleID}, mapper.NewGuildRoleUpdatedProtoEvent(role))
}

func (s *EventService) GuildRoleDeleted(ctx context.Context, ID uuid.UUID, guildID uuid.UUID) error {
	roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, guildID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishRoleEvent([]uuid.UUID{roleID}, mapper.NewGuildRoleDeletedProtoEvent(ID, guildID))
}

func (s *EventService) ChannelCreated(ctx context.Context, ID uuid.UUID) error {
	channel, err := s.channelRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		roleIDs, err := s.guildRoleRepository.GetRoleIDsByChannelID(ctx, channel.ID)
		if err != nil {
			return err
		}

		roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, *channel.GuildID)
		if err != nil {
			return err
		}

		return s.eventPublisher.PublishRoleEvent([]uuid.UUID{roleID}, mapper.NewChannelCreatedProtoEvent(channel, roleIDs, nil))
	}

	users, err := s.channelRepository.GetUsersByChannelID(ctx, channel.ID)
	if err != nil {
		return err
	}

	userIDs := make([]uuid.UUID, len(users))
	for i := 0; i < len(users); i++ {
		userIDs[i] = users[i].ID
	}

	return s.eventPublisher.PublishUserEvent(userIDs, mapper.NewChannelCreatedProtoEvent(channel, nil, users))
}

func (s *EventService) ChannelUpdated(ctx context.Context, ID uuid.UUID) error {
	channel, err := s.channelRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, *channel.GuildID)
		if err != nil {
			return err
		}

		return s.eventPublisher.PublishRoleEvent([]uuid.UUID{roleID}, mapper.NewChannelUpdatedProtoEvent(channel))
	}

	userIDs, err := s.channelRepository.GetUserIDsByChannelID(ctx, channel.ID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishUserEvent(userIDs, mapper.NewChannelUpdatedProtoEvent(channel))
}

func (s *EventService) ChannelDeleted(ctx context.Context, ID uuid.UUID, guildID *uuid.UUID, userIDs []uuid.UUID) error {
	if guildID != nil {
		roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, *guildID)
		if err != nil {
			return err
		}

		return s.eventPublisher.PublishRoleEvent([]uuid.UUID{roleID}, mapper.NewChannelDeletedProtoEvent(ID, guildID))
	}

	return s.eventPublisher.PublishUserEvent(userIDs, mapper.NewChannelDeletedProtoEvent(ID, nil))
}

func (s *EventService) RelationshipCreated(ctx context.Context, ID uuid.UUID) error {

	relationship, err := s.relationshipRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	users, err := s.userRepository.GetByIDs(ctx, []uuid.UUID{relationship.CreatorID, relationship.RecipientID})
	if err != nil {
		return err
	}

	var creator *entities.User
	var recipient *entities.User

	for i := 0; i < len(users); i++ {
		if users[i].ID == relationship.CreatorID {
			creator = users[i]
		} else {
			recipient = users[i]
		}
	}

	if err := s.eventPublisher.PublishUserEvent([]uuid.UUID{relationship.RecipientID}, mapper.NewRelationshipCreatedProtoEvent(relationship, recipient)); err != nil {
		return err
	}

	if err := s.eventPublisher.PublishUserEvent([]uuid.UUID{relationship.RecipientID}, mapper.NewRelationshipCreatedProtoEvent(relationship, creator)); err != nil {
		return err
	}

	return nil
}

func (s *EventService) RelationshipUpdated(ctx context.Context, ID uuid.UUID) error {
	relationship, err := s.relationshipRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	userIDs, err := s.relationshipRepository.GetUserIDsByID(ctx, relationship.ID)
	if err != nil {
		return err
	}

	if err := s.eventPublisher.PublishUserEvent(userIDs, mapper.NewRelationshipUpdatedProtoEvent(relationship)); err != nil {
		return err
	}

	return nil
}

func (s *EventService) RelationshipDeleted(ctx context.Context, ID uuid.UUID, userIDs []uuid.UUID) error {
	return s.eventPublisher.PublishUserEvent(userIDs, mapper.NewRelationshipDeletedProtoEvent(ID))
}

func (s *EventService) ChannelMessageCreated(ctx context.Context, ID uuid.UUID) error {
	channelMessage, err := s.channelMessageRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	user, err := s.userRepository.GetByID(ctx, channelMessage.AuthorID)
	if err != nil {
		return err
	}

	attachments, err := s.attachmentRepository.GetByAssociatedChannelMessageID(ctx, ID)
	if err != nil {
		return err
	}

	channel, err := s.channelRepository.GetByID(ctx, channelMessage.ChannelID)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		guildMember, err := s.guildMemberRepository.GetByID(ctx, user.ID, *channel.GuildID)
		if err != nil {
			return err
		}

		roleIDs, err := s.guildRoleRepository.GetRoleIDsByChannelID(ctx, channelMessage.ChannelID)
		if err != nil {
			return err
		}

		return s.eventPublisher.PublishRoleEvent(roleIDs, mapper.NewChannelMessageCreatedProtoEvent(channelMessage, user, guildMember, attachments))
	}

	userIDs, err := s.channelRepository.GetUserIDsByChannelID(ctx, channelMessage.ChannelID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishUserEvent(userIDs, mapper.NewChannelMessageCreatedProtoEvent(channelMessage, user, nil, attachments))

}

func (s *EventService) ChannelMessageUpdated(ctx context.Context, ID uuid.UUID) error {
	channelMessage, err := s.channelMessageRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	attachments, err := s.attachmentRepository.GetByAssociatedChannelMessageID(ctx, ID)
	if err != nil {
		return err
	}

	channel, err := s.channelRepository.GetByID(ctx, channelMessage.ChannelID)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		roleIDs, err := s.guildRoleRepository.GetRoleIDsByChannelID(ctx, channelMessage.ChannelID)
		if err != nil {
			return err
		}

		return s.eventPublisher.PublishRoleEvent(roleIDs, mapper.NewChannelMessageUpdatedProtoEvent(channelMessage, attachments))
	}

	userIDs, err := s.channelRepository.GetUserIDsByChannelID(ctx, channelMessage.ChannelID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishUserEvent(userIDs, mapper.NewChannelMessageUpdatedProtoEvent(channelMessage, attachments))
}

func (s *EventService) ChannelMessageDeleted(ctx context.Context, ID uuid.UUID, channelID uuid.UUID) error {

	channel, err := s.channelRepository.GetByID(ctx, channelID)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		roleIDs, err := s.guildRoleRepository.GetRoleIDsByChannelID(ctx, channelID)
		if err != nil {
			return err
		}

		return s.eventPublisher.PublishRoleEvent(roleIDs, mapper.NewChannelMessageDeletedProtoEvent(ID, channelID))
	}

	userIDs, err := s.channelRepository.GetUserIDsByChannelID(ctx, channelID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishUserEvent(userIDs, mapper.NewChannelMessageDeletedProtoEvent(ID, channelID))
}

func (s *EventService) InvalidateToken(ctx context.Context, userID uuid.UUID, token string) error {
	var ver int32 = 0
	return s.eventPublisher.PublishProviderEvent(*pb.ProviderOpCode_INVALIDATE_TOKEN.Enum(), userID, &pb.ProviderEvent_InvalidateToken{
		InvalidateToken: &pb.InvalidateToken{
			Ver:   &ver,
			Token: &token,
		},
	})
}

func (s *EventService) UserUpdated(ctx context.Context, ID uuid.UUID) error {
	user, err := s.userRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishUserEvent([]uuid.UUID{ID}, mapper.NewUserUpdatedProtoEvent(user))
}

func (s *EventService) UserRoleAssociated(ctx context.Context, userID uuid.UUID, roleID uuid.UUID) error {
	var ver int32 = 0

	if err := s.eventPublisher.PublishUserEvent([]uuid.UUID{userID}, &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_USER_ROLE_ASSOCIATE.Enum(),
		Payload: &pb.EventPayload_UserRoleAssociated{
			UserRoleAssociated: &pb.UserRoleAssociated{
				Ver:    &ver,
				RoleId: pointer.UUIDToStringPtr(roleID),
			},
		},
	}); err != nil {
		return err
	}

	return s.eventPublisher.PublishProviderEvent(*pb.ProviderOpCode_ASSOCIATE_USER_ROLE.Enum(), userID, &pb.ProviderEvent_UserRoleAssociate{
		UserRoleAssociate: &pb.UserRoleAssociated{
			Ver:    &ver,
			RoleId: pointer.UUIDToStringPtr(roleID),
		},
	})
}

func (s *EventService) UserRoleDisassociated(ctx context.Context, userID uuid.UUID, roleID uuid.UUID) error {
	var ver int32 = 0
	if err := s.eventPublisher.PublishUserEvent([]uuid.UUID{userID}, &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_USER_ROLE_DISASSOCIATE.Enum(),
		Payload: &pb.EventPayload_UserRoleDisassociated{
			UserRoleDisassociated: &pb.UserRoleDisassociated{
				Ver:    &ver,
				RoleId: pointer.UUIDToStringPtr(roleID),
			},
		},
	}); err != nil {
		return err
	}

	return s.eventPublisher.PublishProviderEvent(*pb.ProviderOpCode_ASSOCIATE_USER_ROLE.Enum(), userID, &pb.ProviderEvent_UserRoleDisassociate{
		UserRoleDisassociate: &pb.UserRoleDisassociated{
			Ver:    &ver,
			RoleId: pointer.UUIDToStringPtr(roleID),
		},
	})
}

func (s *EventService) ChannelRolesSet(ctx context.Context, ID uuid.UUID, guildID uuid.UUID, roleIDs []uuid.UUID) error {
	defaultRoleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, guildID)
	if err != nil {
		return err
	}

	var roleIDStrs []string
	for _, roleID := range roleIDs {
		roleIDStrs = append(roleIDStrs, roleID.String())
	}
	var ver int32 = 0
	return s.eventPublisher.PublishRoleEvent([]uuid.UUID{defaultRoleID}, &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_CHANNEL_ROLES_SET.Enum(),
		Payload: &pb.EventPayload_ChannelRolesSet{
			ChannelRolesSet: &pb.ChannelRolesSet{
				Ver:     &ver,
				Id:      pointer.UUIDToStringPtr(ID),
				GuildId: pointer.UUIDToStringPtr(guildID),
				RoleIds: roleIDStrs,
			},
		},
	})
}

func (s *EventService) ChannelRoleAssociated(ctx context.Context, ID uuid.UUID, guildID uuid.UUID, roleID uuid.UUID) error {
	defaultRoleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, guildID)
	if err != nil {
		return err
	}

	var ver int32 = 0
	return s.eventPublisher.PublishRoleEvent([]uuid.UUID{defaultRoleID}, &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_CHANNEL_ROLE_ASSOCIATE.Enum(),
		Payload: &pb.EventPayload_ChannelRoleAssociated{
			ChannelRoleAssociated: &pb.ChannelRoleAssociated{
				Id:      pointer.UUIDToStringPtr(ID),
				GuildId: pointer.UUIDToStringPtr(guildID),
				RoleId:  pointer.UUIDToStringPtr(roleID),
			},
		},
	})
}

func (s *EventService) ChannelRoleDisassociated(ctx context.Context, ID uuid.UUID, guildID uuid.UUID, roleID uuid.UUID) error {
	defaultRoleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, guildID)
	if err != nil {
		return err
	}

	var ver int32 = 0
	return s.eventPublisher.PublishRoleEvent([]uuid.UUID{defaultRoleID}, &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_CHANNEL_ROLE_DISASSOCIATE.Enum(),
		Payload: &pb.EventPayload_ChannelRoleDisassociated{
			ChannelRoleDisassociated: &pb.ChannelRoleDisassociated{
				Ver:     &ver,
				Id:      pointer.UUIDToStringPtr(ID),
				GuildId: pointer.UUIDToStringPtr(guildID),
				RoleId:  pointer.UUIDToStringPtr(roleID),
			},
		},
	})
}
