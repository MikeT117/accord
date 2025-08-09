package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/db"
	"github.com/google/uuid"
)

type GuildCategoryService struct {
	transactor              *db.Transactor
	authorisationService    interfaces.AuthorisationService
	guildCategoryRepository repositories.GuildCategoryRepository
}

func CreateGuildCategoryService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, guildCategoryRepository repositories.GuildCategoryRepository) interfaces.GuildCategoryService {
	return &GuildCategoryService{
		transactor:              transactor,
		authorisationService:    authorisationService,
		guildCategoryRepository: guildCategoryRepository,
	}
}

func (s *GuildCategoryService) GetByID(ctx context.Context, ID uuid.UUID) (*query.GuildCategoryQueryResult, error) {
	guildGategory, err := s.guildCategoryRepository.GetByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	return &query.GuildCategoryQueryResult{
		Result: mapper.NewGuildCategoryResultFromGuildCategory(guildGategory),
	}, nil
}

func (s *GuildCategoryService) GetAll(ctx context.Context) (*query.GuildCategoryQueryListResult, error) {
	guildGategories, err := s.guildCategoryRepository.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	return &query.GuildCategoryQueryListResult{
		Result: mapper.NewGuildCategoryListResultFromGuildCategory(guildGategories),
	}, nil
}

func (s *GuildCategoryService) Create(ctx context.Context, cmd *command.CreateGuildCategoryCommand) error {
	guildCategory, err := entities.NewGuildCategory(cmd.Name)
	if err != nil {
		return err
	}

	if err := s.guildCategoryRepository.Create(ctx, guildCategory); err != nil {
		return err
	}

	return nil
}
