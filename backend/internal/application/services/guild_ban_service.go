package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type GuildBanService struct {
	transactor            *db.Transactor
	guildMemberRepository *db.GuildMemberRepository
	guildBanRepository    *db.GuildBanRepository
}

func CreateGuildBanService(transactor *db.Transactor, guildMemberRepository *db.GuildMemberRepository, guildBanRepository *db.GuildBanRepository) interfaces.GuildBanService {
	return &GuildBanService{
		transactor:            transactor,
		guildMemberRepository: guildMemberRepository,
		guildBanRepository:    guildBanRepository,
	}
}

func (s *GuildBanService) GetByUserIDAndGuildID(ctx context.Context, userID string, guildID string) (*query.GuildBanQueryResult, error) {
	guildBan, err := s.guildBanRepository.GetByUserIDAndGuildID(ctx, userID, guildID)
	if err != nil {
		return nil, err
	}

	return &query.GuildBanQueryResult{
		Result: mapper.NewGuildBanResultFromGuildBan(guildBan),
	}, nil
}
func (s *GuildBanService) GetByGuildID(ctx context.Context, guildID string) (*query.GuildBanQueryListResult, error) {
	guildBans, _, err := s.guildBanRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	return &query.GuildBanQueryListResult{
		Result: mapper.NewGuildBanListResultFromGuildBan(guildBans),
	}, nil
}
func (s *GuildBanService) Create(ctx context.Context, cmd *command.CreateGuildBanCommand) error {
	guildBan, err := entities.NewGuildBan(cmd.GuildID, cmd.UserID, cmd.Reason)
	if err != nil {
		return err
	}

	return s.guildBanRepository.Create(ctx, guildBan)
}
func (s *GuildBanService) Delete(ctx context.Context, userID string, guildID string) error {
	return s.guildBanRepository.Delete(ctx, userID, guildID)
}
