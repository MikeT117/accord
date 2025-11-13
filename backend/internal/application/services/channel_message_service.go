package services

import (
	"context"

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
	eventService             interfaces.EventService
	channelMessageRepository repositories.ChannelMessageRepository
	channelRepository        repositories.ChannelRepository
	userRepository           repositories.UserRepository
	guildMemberRepository    repositories.GuildMemberRepository
	guildRoleRepository      repositories.GuildRoleRepository
	attachmentRepository     repositories.AttachmentRepository
}

func CreateChannelMessageService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, eventService interfaces.EventService, channelMessageRepository repositories.ChannelMessageRepository, channelRepository repositories.ChannelRepository, userRepository repositories.UserRepository,
	guildMemberRepository repositories.GuildMemberRepository, guildRoleRepository repositories.GuildRoleRepository, attachmentRepository repositories.AttachmentRepository) interfaces.ChannelMessageService {
	return &ChannelMessageService{
		transactor:               transactor,
		authorisationService:     authorisationService,
		eventService:             eventService,
		channelMessageRepository: channelMessageRepository,
		channelRepository:        channelRepository,
		userRepository:           userRepository,
		guildMemberRepository:    guildMemberRepository,
		guildRoleRepository:      guildRoleRepository,
		attachmentRepository:     attachmentRepository,
	}
}

func (s *ChannelMessageService) GetByID(ctx context.Context, qry *query.ChannelMessageQuery) (*query.ChannelMessageQueryResult, error) {
	channel, err := s.channelRepository.GetByID(ctx, qry.ChannelID)
	if err != nil {
		return nil, err
	}

	if channel.IsGuildChannel() {
		err := s.authorisationService.VerifyGuildChannelPermission(ctx, qry.ChannelID, qry.RequestorID, constants.VIEW_GUILD_CHANNEL_PERMISSION)
		if err != nil {
			return nil, err
		}
	} else {
		err := s.authorisationService.VerifyPrivateChannelMember(ctx, qry.ChannelID, qry.RequestorID)
		if err != nil {
			return nil, err
		}
	}

	channelMessage, err := s.channelMessageRepository.GetByID(ctx, qry.ID)
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

func (s *ChannelMessageService) GetByChannelID(ctx context.Context, qry *query.ChannelMessagesQuery) (*query.ChannelMessageQueryListResult, error) {

	channel, err := s.channelRepository.GetByID(ctx, qry.ChannelID)
	if err != nil {
		return nil, err
	}

	if channel.IsGuildChannel() {
		err := s.authorisationService.VerifyGuildChannelPermission(ctx, qry.ChannelID, qry.RequestorID, constants.VIEW_GUILD_CHANNEL_PERMISSION)
		if err != nil {
			return nil, err
		}
	} else {
		err := s.authorisationService.VerifyPrivateChannelMember(ctx, qry.ChannelID, qry.RequestorID)
		if err != nil {
			return nil, err
		}
	}

	channelMessage, channelMessageIDs, authorIDs, err := s.channelMessageRepository.GetByChannelID(ctx, qry.ChannelID, qry.Pinned, qry.Before, qry.After, qry.Limit)
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

func (s *ChannelMessageService) Create(ctx context.Context, cmd *command.CreateChannelMessageCommand) error {

	channel, err := s.channelRepository.GetByID(ctx, cmd.ChannelID)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		err := s.authorisationService.VerifyGuildChannelPermission(ctx, cmd.ChannelID, cmd.RequestorID, constants.CREATE_CHANNEL_MESSAGE_PERMISSION)
		if err != nil {
			return err
		}
	} else {
		err := s.authorisationService.VerifyPrivateChannelMember(ctx, cmd.ChannelID, cmd.RequestorID)
		if err != nil {
			return err
		}
	}

	if len(cmd.AttachmentIDs) != 0 {
		attachments, err := s.attachmentRepository.GetByIDs(ctx, cmd.AttachmentIDs)
		if err != nil {
			return err
		}

		for _, attachment := range attachments {
			if attachment.OwnerID != cmd.RequestorID {
				return ErrNotAuthorised
			}
			attachments = append(attachments, attachment)
		}
	}

	channelMessage, err := entities.NewChannelMessage(cmd.Content, cmd.AuthorID, cmd.ChannelID, cmd.AttachmentIDs)
	if err != nil {
		return err
	}

	if err := s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {

		if err := s.channelMessageRepository.Create(ctx, channelMessage); err != nil {
			return err
		}

		for _, attachmentID := range cmd.AttachmentIDs {
			if err := s.channelMessageRepository.AssociateAttachment(ctx, channelMessage.ID, attachmentID); err != nil {
				return err
			}
		}

		return nil

	}); err != nil {
		return err
	}

	return s.eventService.ChannelMessageCreated(ctx, channelMessage.ID)
}

func (s *ChannelMessageService) Update(ctx context.Context, cmd *command.UpdateChannelMessageCommand) error {
	channel, err := s.channelRepository.GetByID(ctx, cmd.ChannelID)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		err := s.authorisationService.VerifyGuildChannelPermission(ctx, cmd.ChannelID, cmd.RequestorID, constants.CREATE_CHANNEL_MESSAGE_PERMISSION)
		if err != nil {
			return err
		}
	} else {
		err := s.authorisationService.VerifyPrivateChannelMember(ctx, cmd.ChannelID, cmd.RequestorID)
		if err != nil {
			return err
		}
	}

	channelMessage, err := s.channelMessageRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if !channelMessage.IsAuthor(cmd.RequestorID) {
		return ErrNotAuthorised
	}

	if err := channelMessage.UpdateContent(cmd.Content); err != nil {
		return err
	}

	if err := s.channelMessageRepository.Update(ctx, channelMessage); err != nil {
		return err
	}

	return s.eventService.ChannelMessageUpdated(ctx, channelMessage.ID)
}

func (s *ChannelMessageService) PinMessage(ctx context.Context, cmd *command.CreateChannelPinCommand) error {
	channel, err := s.channelRepository.GetByID(ctx, cmd.ChannelID)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		err := s.authorisationService.VerifyGuildChannelPermission(ctx, cmd.ChannelID, cmd.RequestorID, constants.CREATE_CHANNEL_PIN_PERMISSION)
		if err != nil {
			return err
		}
	} else {
		err := s.authorisationService.VerifyPrivateChannelMember(ctx, cmd.ChannelID, cmd.RequestorID)
		if err != nil {
			return err
		}
	}

	channelMessage, err := s.channelMessageRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := channelMessage.UpdatePinned(true); err != nil {
		return err
	}

	if err := s.channelMessageRepository.Update(ctx, channelMessage); err != nil {
		return err
	}

	return s.eventService.ChannelMessageUpdated(ctx, channelMessage.ID)
}

func (s *ChannelMessageService) UnpinMessage(ctx context.Context, cmd *command.DeleteChannelPinCommand) error {
	channel, err := s.channelRepository.GetByID(ctx, cmd.ChannelID)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		err := s.authorisationService.VerifyGuildChannelPermission(ctx, cmd.ChannelID, cmd.RequestorID, constants.CREATE_CHANNEL_PIN_PERMISSION)
		if err != nil {
			return err
		}
	} else {
		err := s.authorisationService.VerifyPrivateChannelMember(ctx, cmd.ChannelID, cmd.RequestorID)
		if err != nil {
			return err
		}
	}

	channelMessage, err := s.channelMessageRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := channelMessage.UpdatePinned(false); err != nil {
		return err
	}

	if err := s.channelMessageRepository.Update(ctx, channelMessage); err != nil {
		return err
	}

	return s.eventService.ChannelMessageUpdated(ctx, channelMessage.ID)
}

func (s *ChannelMessageService) Delete(ctx context.Context, cmd *command.DeleteChannelMessageCommand) error {
	channel, err := s.channelRepository.GetByID(ctx, cmd.ChannelID)
	if err != nil {
		return err
	}

	if channel.IsGuildChannel() {
		err := s.authorisationService.VerifyGuildChannelPermission(ctx, cmd.ChannelID, cmd.RequestorID, constants.CREATE_CHANNEL_PIN_PERMISSION)
		if err != nil {
			return err
		}
	} else {
		err := s.authorisationService.VerifyPrivateChannelMember(ctx, cmd.ChannelID, cmd.RequestorID)
		if err != nil {
			return err
		}
	}

	channelMessage, err := s.channelMessageRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if !channelMessage.IsAuthor(cmd.RequestorID) {
		return ErrNotAuthorised
	}

	if err := s.channelMessageRepository.Delete(ctx, cmd.ID); err != nil {
		return err
	}

	return s.eventService.ChannelMessageDeleted(ctx, channelMessage.ID, channelMessage.ChannelID)
}
