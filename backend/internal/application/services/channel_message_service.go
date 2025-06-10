package services

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type ChannelMessageService struct {
	transactor               *db.Transactor
	channelMessageRepository *db.ChannelMessageRepository
	userRepository           *db.UserRepository
	guildMemberRepository    *db.GuildMemberRepository
	guildRoleRepository      *db.GuildRoleRepository
	attachmentRepository     *db.AttachmentRepository
}

func CreateChannelMessageService(transactor *db.Transactor, channelMessageRepository *db.ChannelMessageRepository, userRepository *db.UserRepository,
	guildMemberRepository *db.GuildMemberRepository, guildRoleRepository *db.GuildRoleRepository, attachmentRepository *db.AttachmentRepository) interfaces.ChannelMessageService {
	return &ChannelMessageService{
		transactor:               transactor,
		channelMessageRepository: channelMessageRepository,
		userRepository:           userRepository,
		guildMemberRepository:    guildMemberRepository,
		guildRoleRepository:      guildRoleRepository,
		attachmentRepository:     attachmentRepository,
	}
}

func (s *ChannelMessageService) GetByID(ctx context.Context, ID string) (*query.ChannelMessageQueryResult, error) {
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

	if channelMessage.WithinGuild() {
		guildMember, err := s.guildMemberRepository.GetByID(ctx, user.ID, *channelMessage.GuildID)
		if err != nil {
			return nil, err
		}

		return &query.ChannelMessageQueryResult{
			Result: mapper.NewGuildChannelMessageResultFromChannelMessage(channelMessage, user, guildMember, attachments),
		}, nil
	}

	return &query.ChannelMessageQueryResult{
		Result: mapper.NewUserChannelMessageResultFromChannelMessage(channelMessage, user, attachments),
	}, nil
}

func (s *ChannelMessageService) GetByChannelID(ctx context.Context, channelID string) (*query.ChannelMessageQueryListResult, error) {
	channelMessage, channelMessageIDs, authorIDs, err := s.channelMessageRepository.GetByChannelID(ctx, channelID, time.Now().UTC().Unix(), 50)
	if err != nil {
		return nil, err
	}

	if len(channelMessage) == 0 {
		return &query.ChannelMessageQueryListResult{
			Result: []*common.ChannelMessageResult{},
		}, nil
	}

	usersMap, err := s.userRepository.GetByIDs(ctx, authorIDs)
	if err != nil {
		return nil, err
	}

	attachments, err := s.attachmentRepository.GetByAssociatedChannelMessageIDs(ctx, channelMessageIDs)
	if err != nil {
		return nil, err
	}

	if channelMessage[0].WithinGuild() {
		guildMembersMap, err := s.guildMemberRepository.GetByIDs(ctx, authorIDs, *channelMessage[0].GuildID)
		if err != nil {
			return nil, err
		}

		return &query.ChannelMessageQueryListResult{
			Result: mapper.NewGuildChannelMessageListResultFromChannelMessage(channelMessage, usersMap, guildMembersMap, attachments),
		}, nil
	}

	return &query.ChannelMessageQueryListResult{
		Result: mapper.NewUserChannelMessageListResultFromChannelMessage(channelMessage, usersMap, attachments),
	}, nil
}

func (s *ChannelMessageService) Create(ctx context.Context, cmd *command.CreateChannelMessageCommand) error {
	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {

		channelMessage, err := entities.NewChannelMessage(cmd.Content, *cmd.AuthorID, *cmd.ChannelID, cmd.GuildID, cmd.AttachmentIDs)
		if err != nil {
			return err
		}

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
func (s *ChannelMessageService) Update(ctx context.Context, cmd *command.UpdateChannelMessageCommand) error {
	channelMessage, err := s.channelMessageRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	channelMessage.UpdateContent(cmd.Content)
	return s.channelMessageRepository.Update(ctx, channelMessage)
}
func (s *ChannelMessageService) Delete(ctx context.Context, ID string) error {
	return s.channelMessageRepository.Delete(ctx, ID)
}
