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

func (s *RelationshipService) Create(ctx context.Context, cmd *command.CreateRelationshipCommand) error {
	switch cmd.Status {
	case constants.BLOCKED_RELATIONSHIP:
		return s.createBlockedRelationship(ctx, cmd.CreatorID, cmd.Username)
	case constants.PENDING_RELATIONSHIP:
		return s.createPendingRelationship(ctx, cmd.CreatorID, cmd.Username)
	default:
		return ErrNotAuthorised
	}
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
	relationship, err := s.relationshipRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if (relationship.CreatorID != cmd.RequestorID && relationship.RecipientID != cmd.RequestorID) || (relationship.RecipientID == cmd.RequestorID && relationship.IsBlocked()) {
		return ErrNotAuthorised
	}

	userIDs, err := s.relationshipRepository.GetUserIDsByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := s.relationshipRepository.Delete(ctx, cmd.ID); err != nil {
		return err
	}

	return s.eventService.RelationshipDeleted(ctx, cmd.ID, userIDs)
}

func (s *RelationshipService) createBlockedRelationship(ctx context.Context, creatorID uuid.UUID, username string) error {
	user, err := s.userRepository.GetByUsername(ctx, username)
	if err != nil {
		return err
	}

	existingRelationships, err := s.relationshipRepository.GetByUserIDAndUserIDs(ctx, creatorID, []uuid.UUID{user.ID})
	if err != nil {
		return err
	}

	if len(existingRelationships) == 0 {
		relationship, err := entities.NewRelationship(creatorID, constants.BLOCKED_RELATIONSHIP, user.ID)
		if err != nil {
			return err
		}

		if err := s.relationshipRepository.Create(ctx, relationship); err != nil {
			return err
		}

		return s.eventService.RelationshipCreated(ctx, relationship.ID)
	}

	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {
		for i := 0; i < len(existingRelationships); i++ {

			if !existingRelationships[i].IsBlocked() {
				if err := s.relationshipRepository.Delete(ctx, existingRelationships[0].ID); err != nil {
					return err
				}
			} else if existingRelationships[i].IsCreator(creatorID) {
				return nil
			}

		}

		relationship, err := entities.NewRelationship(creatorID, constants.BLOCKED_RELATIONSHIP, user.ID)
		if err != nil {
			return err
		}

		if err := s.relationshipRepository.Create(ctx, relationship); err != nil {
			return err
		}

		return s.eventService.RelationshipCreated(ctx, relationship.ID)

	})

}

func (s *RelationshipService) createPendingRelationship(ctx context.Context, creatorID uuid.UUID, username string) error {
	user, err := s.userRepository.GetByUsername(ctx, username)
	if err != nil {
		return err
	}

	if !user.AllowsFriendRequests() {
		return ErrNotAuthorised
	}

	existingRelationships, err := s.relationshipRepository.GetByUserIDAndUserIDs(ctx, creatorID, []uuid.UUID{user.ID})
	if err != nil {
		return err
	}

	if len(existingRelationships) == 0 {
		relationship, err := entities.NewRelationship(creatorID, constants.PENDING_RELATIONSHIP, user.ID)
		if err != nil {
			return err
		}

		if err := s.relationshipRepository.Create(ctx, relationship); err != nil {
			return err
		}

		return s.eventService.RelationshipCreated(ctx, relationship.ID)
	}

	for i := 0; i < len(existingRelationships); i++ {
		if existingRelationships[i].IsBlocked() {
			return ErrNotAuthorised
		}
	}

	return nil
}
