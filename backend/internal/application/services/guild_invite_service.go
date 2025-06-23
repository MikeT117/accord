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

func (s *GuildInviteService) GetByID(ctx context.Context, ID string) (*query.GuildInviteQueryResult, error) {
	guildInvite, err := s.guildInviteRepository.GetByID(ctx, ID)
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

func (s *GuildInviteService) GetByGuildID(ctx context.Context, guildID string, requestorID string) (*query.GuildInviteQueryListResult, error) {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, guildID, requestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return nil, err
	}

	guildInvites, err := s.guildInviteRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	guild, err := s.guildRepository.GetByID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	return &query.GuildInviteQueryListResult{
		Result: mapper.NewGuildInviteListResultFromGuildInvite(guildInvites, guild),
	}, nil
}

func (s *GuildInviteService) Create(ctx context.Context, cmd *command.CreateGuildInviteCommand, requestorID string) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, requestorID, constants.MANAGE_GUILD_PERMISSION)
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
func (s *GuildInviteService) Delete(ctx context.Context, ID string, guildID string, requestorID string) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, guildID, requestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildInviteRepository.Delete(ctx, ID); err != nil {
		return err
	}

	return nil
}
