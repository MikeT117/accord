package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/pubsub"
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

func (s *EventService) GuildCreated(ctx context.Context, ID string) error {
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

	return s.eventPublisher.PublishUserEvent(
		[]string{guild.CreatorID},
		mapper.NewGuildCreatedProtoEvent(guild, channels, channelRoles, roles),
	)
}

func (s *EventService) GuildUpdated(ctx context.Context, ID string) error {
	guild, err := s.guildRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, guild.ID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishRoleEvent(
		[]string{roleID},
		mapper.NewGuildUpdatedProtoEvent(guild),
	)
}

func (s *EventService) GuildDeleted(ctx context.Context, ID string, roleID string) error {
	return s.eventPublisher.PublishRoleEvent([]string{roleID}, mapper.NewGuildDeletedProtoEvent(ID))
}

func (s *EventService) GuildRoleCreated(ctx context.Context, ID string) error {
	role, err := s.guildRoleRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, role.GuildID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishRoleEvent([]string{roleID}, mapper.NewGuildRoleCreatedProtoEvent(role))
}

func (s *EventService) GuildRoleUpdated(ctx context.Context, ID string) error {
	role, err := s.guildRoleRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, role.GuildID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishRoleEvent([]string{roleID}, mapper.NewGuildRoleUpdatedProtoEvent(role))
}

func (s *EventService) GuildRoleDeleted(ctx context.Context, ID string, guildID string) error {
	roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, guildID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishRoleEvent([]string{roleID}, mapper.NewGuildRoleDeletedProtoEvent(ID, guildID))
}

func (s *EventService) ChannelCreated(ctx context.Context, ID string) error {
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

		return s.eventPublisher.PublishRoleEvent([]string{roleID}, mapper.NewChannelCreatedProtoEvent(channel, roleIDs, nil))
	}

	users, err := s.channelRepository.GetUsersByChannelID(ctx, channel.ID)
	if err != nil {
		return err
	}

	userIDs := make([]string, len(users))
	for i := 0; i < len(users); i++ {
		userIDs[i] = users[i].ID
	}

	return s.eventPublisher.PublishUserEvent(userIDs, mapper.NewChannelCreatedProtoEvent(channel, nil, users))
}

func (s *EventService) ChannelUpdated(ctx context.Context, ID string) error {
	channel, err := s.channelRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, *channel.GuildID)
		if err != nil {
			return err
		}

		return s.eventPublisher.PublishRoleEvent([]string{roleID}, mapper.NewChannelUpdatedProtoEvent(channel))
	}

	userIDs, err := s.channelRepository.GetUserIDsByChannelID(ctx, channel.ID)
	if err != nil {
		return err
	}

	return s.eventPublisher.PublishUserEvent(userIDs, mapper.NewChannelUpdatedProtoEvent(channel))
}

func (s *EventService) ChannelDeleted(ctx context.Context, ID string, guildID *string, roleIDs []string, userIDs []string) error {
	if guildID != nil {
		return s.eventPublisher.PublishRoleEvent(roleIDs, mapper.NewChannelDeletedProtoEvent(ID, guildID))
	}

	return s.eventPublisher.PublishUserEvent(userIDs, mapper.NewChannelDeletedProtoEvent(ID, nil))
}

func (s *EventService) RelationshipCreated(ctx context.Context, ID string) error {

	relationship, err := s.relationshipRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	users, err := s.userRepository.GetByIDs(ctx, []string{relationship.CreatorID, relationship.RecipientID})
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

	if err := s.eventPublisher.PublishUserEvent([]string{relationship.RecipientID}, mapper.NewRelationshipCreatedProtoEvent(relationship, recipient)); err != nil {
		return err
	}

	if err := s.eventPublisher.PublishUserEvent([]string{relationship.RecipientID}, mapper.NewRelationshipCreatedProtoEvent(relationship, creator)); err != nil {
		return err
	}

	return nil
}

func (s *EventService) RelationshipUpdated(ctx context.Context, ID string) error {
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

func (s *EventService) RelationshipDeleted(ctx context.Context, ID string, userIDs []string) error {
	return s.eventPublisher.PublishUserEvent(userIDs, mapper.NewRelationshipDeletedProtoEvent(ID))
}

func (s *EventService) ChannelMessageCreated(ctx context.Context, ID string) error {
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

func (s *EventService) ChannelMessageUpdated(ctx context.Context, ID string) error {
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

func (s *EventService) ChannelMessageDeleted(ctx context.Context, ID string, channelID string) error {

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
