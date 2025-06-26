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
}

func CreateGuildInviteService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, guildInviteRepository repositories.GuildInviteRepository, guildRepository repositories.GuildRepository) interfaces.GuildInviteService {
	return &GuildInviteService{
		transactor:            transactor,
		authorisationService:  authorisationService,
		guildInviteRepository: guildInviteRepository,
		guildRepository:       guildRepository,
	}
}

func (s *GuildInviteService) GetByID(ctx context.Context, qry *query.GuildInviteQuery) (*query.GuildInviteQueryResult, error) {
	guildInvite, err := s.guildInviteRepository.GetByID(ctx, qry.ID)
	if err != nil {
		return nil, err
	}

	guild, err := s.guildRepository.GetByID(ctx, guildInvite.GuildID)
	if err != nil {
		return nil, err
	}

	return &query.GuildInviteQueryResult{
		Result: mapper.NewGuildInviteResultFromGuildInvite(guildInvite, guild),
	}, nil
}

func (s *GuildInviteService) GetByGuildID(ctx context.Context, qry *query.GuildInvitesQuery) (*query.GuildInviteQueryListResult, error) {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, qry.GuildID, qry.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return nil, err
	}

	guildInvites, err := s.guildInviteRepository.GetByGuildID(ctx, qry.GuildID)
	if err != nil {
		return nil, err
	}

	guild, err := s.guildRepository.GetByID(ctx, qry.GuildID)
	if err != nil {
		return nil, err
	}

	return &query.GuildInviteQueryListResult{
		Result: mapper.NewGuildInviteListResultFromGuildInvite(guildInvites, guild),
	}, nil
}

func (s *GuildInviteService) Create(ctx context.Context, cmd *command.CreateGuildInviteCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	guildInvite, err := entities.NewGuildInvite(cmd.GuildID, cmd.ExpiresAt)
	if err != nil {
		return err
	}

	if err := s.guildInviteRepository.Create(ctx, guildInvite); err != nil {
		return err
	}

	return nil
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
