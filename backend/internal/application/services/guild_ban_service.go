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
	"github.com/google/uuid"
)

type GuildBanService struct {
	transactor            *db.Transactor
	authorisationService  interfaces.AuthorisationService
	guildMemberRepository repositories.GuildMemberRepository
	guildBanRepository    repositories.GuildBanRepository
}

func CreateGuildBanService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, guildMemberRepository repositories.GuildMemberRepository, guildBanRepository repositories.GuildBanRepository) interfaces.GuildBanService {
	return &GuildBanService{
		transactor:            transactor,
		authorisationService:  authorisationService,
		guildMemberRepository: guildMemberRepository,
		guildBanRepository:    guildBanRepository,
	}
}

func (s *GuildBanService) GetByGuildID(ctx context.Context, guildID uuid.UUID, requestorID uuid.UUID) (*query.GuildBanQueryListResult, error) {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, guildID, requestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return nil, err
	}

	guildBans, _, err := s.guildBanRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	return &query.GuildBanQueryListResult{
		Result: mapper.NewGuildBanListResultFromGuildBan(guildBans),
	}, nil
}

func (s *GuildBanService) Create(ctx context.Context, cmd *command.CreateGuildBanCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	guildBan, err := entities.NewGuildBan(cmd.GuildID, cmd.UserID, cmd.Reason)
	if err != nil {
		return err
	}

	if err := s.guildBanRepository.Create(ctx, guildBan); err != nil {
		return err
	}

	return nil
}

func (s *GuildBanService) Delete(ctx context.Context, cmd *command.DeleteGuildBanCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.GuildID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return err
	}

	if err := s.guildBanRepository.Delete(ctx, cmd.UserID, cmd.GuildID); err != nil {
		return err
	}

	return nil
}
