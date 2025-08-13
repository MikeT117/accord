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

type GuildBanService struct {
	transactor            *db.Transactor
	authorisationService  interfaces.AuthorisationService
	guildMemberRepository repositories.GuildMemberRepository
	guildBanRepository    repositories.GuildBanRepository
	userRepository        repositories.UserRepository
}

func CreateGuildBanService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, guildMemberRepository repositories.GuildMemberRepository, guildBanRepository repositories.GuildBanRepository, userRepository repositories.UserRepository) interfaces.GuildBanService {
	return &GuildBanService{
		transactor:            transactor,
		authorisationService:  authorisationService,
		guildMemberRepository: guildMemberRepository,
		guildBanRepository:    guildBanRepository,
		userRepository:        userRepository,
	}
}

func (s *GuildBanService) GetByGuildID(ctx context.Context, qry *query.GuildBansQuery) (*query.GuildBanQueryListResult, error) {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, qry.GuildID, qry.RequestorID, constants.MANAGE_GUILD_PERMISSION)
	if err != nil {
		return nil, err
	}

	guildBans, userIDs, err := s.guildBanRepository.GetByGuildID(ctx, qry.GuildID, qry.Before, qry.Limit)
	if err != nil {
		return nil, err
	}

	guildMembersMap, err := s.guildMemberRepository.GetMapByIDs(ctx, userIDs, qry.GuildID)
	if err != nil {
		return nil, err
	}

	usersMap, err := s.userRepository.GetMapByIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	return &query.GuildBanQueryListResult{
		Result: mapper.NewGuildBanListResult(guildBans, guildMembersMap, usersMap),
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
