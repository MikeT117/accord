package services

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type ChannelMessageService struct {
	transactor               *db.Transactor
	authorisationService     interfaces.AuthorisationService
	channelMessageRepository repositories.ChannelMessageRepository
	channelRepository        repositories.ChannelRepository
	userRepository           repositories.UserRepository
	guildMemberRepository    repositories.GuildMemberRepository
	guildRoleRepository      repositories.GuildRoleRepository
	attachmentRepository     repositories.AttachmentRepository
}

func CreateChannelMessageService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, channelMessageRepository repositories.ChannelMessageRepository, channelRepository repositories.ChannelRepository, userRepository repositories.UserRepository,
	guildMemberRepository repositories.GuildMemberRepository, guildRoleRepository repositories.GuildRoleRepository, attachmentRepository repositories.AttachmentRepository) interfaces.ChannelMessageService {
	return &ChannelMessageService{
		transactor:               transactor,
		authorisationService:     authorisationService,
		channelMessageRepository: channelMessageRepository,
		channelRepository:        channelRepository,
		userRepository:           userRepository,
		guildMemberRepository:    guildMemberRepository,
		guildRoleRepository:      guildRoleRepository,
		attachmentRepository:     attachmentRepository,
	}
}

func (s *ChannelMessageService) GetByID(ctx context.Context, ID string, channelID string, requestorID string) (*query.ChannelMessageQueryResult, error) {
	err := s.authorisationService.VerifyUserChannelPermission(ctx, channelID, requestorID, constants.VIEW_GUILD_CHANNEL_PERMISSION)
	if err != nil {
		return nil, err
	}

	channelMessage, err := s.channelMessageRepository.GetByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	user, err := s.userRepository.GetByID(ctx, channelMessage.AuthorID)
	if err != nil {
		return nil, err
	}

	attachments, err := s.attachmentRepository.GetByAssociatedChannelMessageID(ctx, channelMessage.ID)
	if err != nil {
		return nil, err
	}

	channel, err := s.channelRepository.GetByID(ctx, channelID)
	if err != nil {
		return nil, err
	}

	var guildMember *entities.GuildMember
	if channel.IsGuildChannel() {
		guildMember, err = s.guildMemberRepository.GetByID(ctx, user.ID, *channel.GuildID)
		if err != nil {
			return nil, err
		}
	}

	return &query.ChannelMessageQueryResult{
		Result: mapper.NewChannelMessageResultFromChannelMessage(channelMessage, user, guildMember, attachments),
	}, nil
}

func (s *ChannelMessageService) GetByChannelID(ctx context.Context, channelID string, pinned bool, before time.Time, requestorID string) (*query.ChannelMessageQueryListResult, error) {
	err := s.authorisationService.VerifyUserChannelPermission(ctx, channelID, requestorID, constants.VIEW_GUILD_CHANNEL_PERMISSION)
	if err != nil {
		return nil, err
	}

	channelMessage, channelMessageIDs, authorIDs, err := s.channelMessageRepository.GetByChannelID(ctx, channelID, pinned, before, 50)
	if err != nil {
		return nil, err
	}

	if len(channelMessage) == 0 {
		return &query.ChannelMessageQueryListResult{
			Result: []*common.ChannelMessageResult{},
		}, nil
	}

	usersMap, err := s.userRepository.GetMapByIDs(ctx, authorIDs)
	if err != nil {
		return nil, err
	}

	attachments, err := s.attachmentRepository.GetMapByAssociatedChannelMessageIDs(ctx, channelMessageIDs)
	if err != nil {
		return nil, err
	}

	channel, err := s.channelRepository.GetByID(ctx, channelID)
	if err != nil {
		return nil, err
	}

	if !channel.IsGuildChannel() {
		return &query.ChannelMessageQueryListResult{
			Result: mapper.NewChannelMessageListResultFromChannelMessage(channelMessage, usersMap, nil, attachments),
		}, nil
	}

	guildMembersMap, err := s.guildMemberRepository.GetMapByIDs(ctx, authorIDs, *channel.GuildID)
	if err != nil {
		return nil, err
	}

	return &query.ChannelMessageQueryListResult{
		Result: mapper.NewChannelMessageListResultFromChannelMessage(channelMessage, usersMap, guildMembersMap, attachments),
	}, nil

}

func (s *ChannelMessageService) Create(ctx context.Context, cmd *command.CreateChannelMessageCommand, requestorID string) error {
	err := s.authorisationService.VerifyUserChannelPermission(ctx, cmd.ChannelID, requestorID, constants.CREATE_CHANNEL_MESSAGE_PERMISSION)
	if err != nil {
		return err
	}

	if len(cmd.AttachmentIDs) != 0 {
		attachments, err := s.attachmentRepository.GetByIDs(ctx, cmd.AttachmentIDs)
		if err != nil {
			return err
		}

		for _, attachment := range attachments {
			if attachment.OwnerID != requestorID {
				return ErrNotAuthorised
			}
		}
	}

	channelMessage, err := entities.NewChannelMessage(cmd.Content, cmd.AuthorID, cmd.ChannelID, cmd.AttachmentIDs)
	if err != nil {
		return err
	}

	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		if err := s.channelMessageRepository.Create(ctx, channelMessage); err != nil {
			return err
		}

		for _, attachmentID := range cmd.AttachmentIDs {
			if err := s.channelMessageRepository.AssociateAttachment(ctx, channelMessage.ID, attachmentID); err != nil {
				return err
			}
		}

		return nil
	})
}
func (s *ChannelMessageService) Update(ctx context.Context, cmd *command.UpdateChannelMessageCommand, requestorID string) error {
	err := s.authorisationService.VerifyUserChannelPermission(ctx, cmd.ChannelID, requestorID, constants.CREATE_CHANNEL_MESSAGE_PERMISSION)
	if err != nil {
		return err
	}

	channelMessage, err := s.channelMessageRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if !channelMessage.IsAuthor(cmd.AuthorID) {
		return ErrNotAuthorised
	}

	if err := channelMessage.UpdateContent(cmd.Content); err != nil {
		return err
	}

	if err := s.channelMessageRepository.Update(ctx, channelMessage); err != nil {
		return err
	}

	return nil
}

func (s *ChannelMessageService) Delete(ctx context.Context, cmd *command.DeleteChannelMessageCommand, requestorID string) error {
	err := s.authorisationService.VerifyUserChannelPermission(ctx, cmd.ChannelID, requestorID, constants.CREATE_CHANNEL_MESSAGE_PERMISSION)
	if err != nil {
		return err
	}

	channelMessage, err := s.channelMessageRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if !channelMessage.IsAuthor(requestorID) {
		return ErrNotAuthorised
	}

	if err := s.channelMessageRepository.Delete(ctx, cmd.ID); err != nil {
		return err
	}

	return nil
}
