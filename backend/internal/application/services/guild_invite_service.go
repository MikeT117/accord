package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type GuildInviteService struct {
	transactor            *db.Transactor
	authorisationService  interfaces.AuthorisationService
	guildInviteRepository repositories.GuildInviteRepository
	guildRepository       repositories.GuildRepository
	guildMemberRepository repositories.GuildMemberRepository
	userRepository        repositories.UserRepository
}

func CreateGuildInviteService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, guildInviteRepository repositories.GuildInviteRepository, guildRepository repositories.GuildRepository, guildMemberRepository repositories.GuildMemberRepository, userRepository repositories.UserRepository) interfaces.GuildInviteService {
	return &GuildInviteService{
		transactor:            transactor,
		authorisationService:  authorisationService,
		guildInviteRepository: guildInviteRepository,
		guildRepository:       guildRepository,
		guildMemberRepository: guildMemberRepository,
		userRepository:        userRepository,
	}
}

func (s *GuildInviteService) GetPublicByID(ctx context.Context, qry *query.PublicInviteQuery) (*query.PublicInviteQueryResult, error) {
	guildInvite, err := s.guildInviteRepository.GetByID(ctx, qry.ID)
	if err != nil {
		return nil, err
	}

	guild, err := s.guildRepository.GetByID(ctx, guildInvite.GuildID)
	if err != nil {
		return nil, err
	}

	return &query.PublicInviteQueryResult{
		Result: mapper.NewPublicInviteResultFromGuildInvite(guildInvite, guild),
	}, nil
}

func (s *GuildInviteService) GetByGuildID(ctx context.Context, qry *query.GuildInvitesQuery) (*query.GuildInviteQueryListResult, error) {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, qry.GuildID, qry.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return nil, err
	}

	guildInvites, creatorIDs, err := s.guildInviteRepository.GetByGuildID(ctx, qry.GuildID, qry.Before, qry.After, qry.Limit)
	if err != nil {
		return nil, err
	}

	guildMembersMap, err := s.guildMemberRepository.GetMapByIDs(ctx, creatorIDs, qry.GuildID)
	if err != nil {
		return nil, err
	}

	usersMap, err := s.userRepository.GetMapByIDs(ctx, creatorIDs)
	if err != nil {
		return nil, err
	}

	return &query.GuildInviteQueryListResult{
		Result: mapper.NewGuildInviteListResultFromGuildInvite(guildInvites, usersMap, guildMembersMap),
	}, nil
}

func (s *GuildInviteService) Create(ctx context.Context, cmd *command.CreateGuildInviteCommand) (*command.CreateGuildInviteCommandResult, error) {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return nil, err
	}

	guildInvite, err := entities.NewGuildInvite(cmd.GuildID, cmd.ExpiresAt, cmd.RequestorID)
	if err != nil {
		return nil, err
	}

	if err := s.guildInviteRepository.Create(ctx, guildInvite); err != nil {
		return nil, err
	}

	user, err := s.userRepository.GetByID(ctx, cmd.RequestorID)
	if err != nil {
		return nil, err
	}

	guildMember, err := s.guildMemberRepository.GetByID(ctx, cmd.RequestorID, cmd.GuildID)
	if err != nil {
		return nil, err
	}

	return &command.CreateGuildInviteCommandResult{
		Result: mapper.NewGuildInviteResultFromGuildInvite(guildInvite, user, guildMember),
	}, nil
}

func (s *GuildInviteService) Delete(ctx context.Context, cmd *command.DeleteGuildInviteCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildInviteRepository.Delete(ctx, cmd.ID); err != nil {
		return err
	}

	return nil
}
