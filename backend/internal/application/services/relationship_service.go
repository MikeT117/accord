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

type RelationshipService struct {
	transactor             *db.Transactor
	authorisationService   interfaces.AuthorisationService
	eventService           interfaces.EventService
	relationshipRepository repositories.RelationshipRepository
	userRepository         repositories.UserRepository
}

func CreateRelationshipService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, eventService interfaces.EventService, relationshipRepository repositories.RelationshipRepository, userRepository repositories.UserRepository) interfaces.RelationshipService {
	return &RelationshipService{
		transactor:             transactor,
		authorisationService:   authorisationService,
		eventService:           eventService,
		relationshipRepository: relationshipRepository,
		userRepository:         userRepository,
	}
}

type RelationshipQuery struct {
	ID     string
	UserID string
}
type RelationshipsQuery struct {
	UserID string
}

func (s *RelationshipService) GetByID(ctx context.Context, ID uuid.UUID, userID uuid.UUID) (*query.RelationshipQueryResult, error) {
	relationship, err := s.relationshipRepository.GetByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	var nonRequestingUserID uuid.UUID
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

func (s *RelationshipService) GetByUserID(ctx context.Context, qry *query.RelatationshipsQuery) (*query.RelationshipQueryListResult, error) {
	relationship, userIDs, err := s.relationshipRepository.GetByUserID(ctx, qry.RequestorID, qry.Status, qry.Before, 50)
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
			qry.RequestorID,
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

	return s.eventService.RelationshipCreated(ctx, relationship.ID)
}

func (s *RelationshipService) Update(ctx context.Context, cmd *command.UpdateRelationshipCommand) error {
	relationship, err := s.relationshipRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if relationship.IsPending() && relationship.IsCreator(cmd.RequestorID) {
		return ErrNotAuthorised
	}

	if err := relationship.Updatestatus(cmd.Status); err != nil {
		return err
	}

	if err := s.relationshipRepository.Update(ctx, relationship); err != nil {
		return err
	}

	return s.eventService.RelationshipUpdated(ctx, relationship.ID)
}

func (s *RelationshipService) Delete(ctx context.Context, cmd *command.DeleteRelationshipCommand) error {
	userIDs, err := s.relationshipRepository.GetUserIDsByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := s.relationshipRepository.Delete(ctx, cmd.ID, cmd.RequestorID); err != nil {
		return err
	}

	return s.eventService.RelationshipDeleted(ctx, cmd.ID, userIDs)
}
