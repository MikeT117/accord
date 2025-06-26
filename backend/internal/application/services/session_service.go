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

type SessionService struct {
	transactor        *db.Transactor
	sessionRepository repositories.SessionRepository
	userRepository    repositories.UserRepository
}

func CreateSessionService(transactor *db.Transactor, sessionRepository repositories.SessionRepository, userRepository repositories.UserRepository) interfaces.SessionService {
	return &SessionService{
		transactor:        transactor,
		sessionRepository: sessionRepository,
		userRepository:    userRepository,
	}
}

func (s *SessionService) GetByID(ctx context.Context, ID string, userID string) (*query.SessionQueryResult, error) {
	session, err := s.sessionRepository.GetByID(ctx, ID, userID)
	if err != nil {
		return nil, err
	}

	return &query.SessionQueryResult{
		Result: mapper.NewSessionResultFromSession(session),
	}, nil
}

func (s *SessionService) GetByUserID(ctx context.Context, userID string) (*query.SessionQueryListResult, error) {
	sessions, err := s.sessionRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &query.SessionQueryListResult{
		Result: mapper.NewSessionListResultFromSession(sessions),
	}, nil
}

func (s *SessionService) GetByToken(ctx context.Context, token string) (*query.SessionQueryResult, error) {
	session, err := s.sessionRepository.GetByToken(ctx, token)
	if err != nil {
		return nil, err
	}

	return &query.SessionQueryResult{
		Result: mapper.NewSessionResultFromSession(session),
	}, nil
}

func (s *SessionService) Create(ctx context.Context, cmd *command.CreateSessionCommand) error {
	session, err := entities.NewSession(cmd.UserID, cmd.Token, cmd.ExpiresAt, cmd.IPAddress, cmd.UserAgent)
	if err != nil {
		return err
	}

	if err := s.sessionRepository.Create(ctx, session); err != nil {
		return err
	}

	return nil
}

func (s *SessionService) Delete(ctx context.Context, cmd *command.DeleteSessionCommand) error {
	if err := s.sessionRepository.DeleteByID(ctx, cmd.ID, cmd.RequestorID); err != nil {
		return err
	}

	return nil
}
