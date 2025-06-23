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
)

type RelationshipService struct {
	transactor             *db.Transactor
	authorisationService   interfaces.AuthorisationService
	relationshipRepository repositories.RelationshipRepository
	userRepository         repositories.UserRepository
}

func CreateRelationshipService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, relationshipRepository repositories.RelationshipRepository, userRepository repositories.UserRepository) interfaces.RelationshipService {
	return &RelationshipService{
		transactor:             transactor,
		authorisationService:   authorisationService,
		relationshipRepository: relationshipRepository,
		userRepository:         userRepository,
	}
}

func (s *RelationshipService) GetByID(ctx context.Context, ID string, userID string) (*query.RelationshipQueryResult, error) {
	relationship, err := s.relationshipRepository.GetByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	var nonRequestingUserID string
	if userID != relationship.CreatorID {
		nonRequestingUserID = relationship.CreatorID
	} else {
		nonRequestingUserID = relationship.RecipientID
	}

	user, err := s.userRepository.GetByID(ctx, nonRequestingUserID)
	if err != nil {
		return nil, err
	}

	return &query.RelationshipQueryResult{
		Result: mapper.NewRelationshipResultFromRelationship(relationship, user),
	}, nil
}

func (s *RelationshipService) GetByUserID(ctx context.Context, userID string) (*query.RelationshipQueryListResult, error) {
	relationship, userIDs, err := s.relationshipRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	usersMap, err := s.userRepository.GetMapByIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	return &query.RelationshipQueryListResult{
		Result: mapper.NewRelationshipListResultFromRelationship(
			relationship,
			usersMap,
			userID,
		),
	}, nil
}

func (s *RelationshipService) Create(ctx context.Context, cmd *command.CreateRelationshipCommand) error {
	relationship, err := entities.NewRelationship(cmd.CreatorID, cmd.Status, cmd.RecipientID)
	if err != nil {
		return err
	}

	if err := s.relationshipRepository.Create(ctx, relationship); err != nil {
		return err
	}

	return nil
}

func (s *RelationshipService) Update(ctx context.Context, ID string, status int8) error {
	relationship, err := s.relationshipRepository.GetByID(ctx, ID)
	if err != nil {
		return err
	}

	if err := relationship.Updatestatus(status); err != nil {
		return err
	}

	if err := s.relationshipRepository.Update(ctx, relationship); err != nil {
		return err
	}

	return nil
}

func (s *RelationshipService) Delete(ctx context.Context, ID string) error {
	if err := s.relationshipRepository.Delete(ctx, ID); err != nil {
		return err
	}

	return nil
}
