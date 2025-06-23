package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewSessionResultFromSession(session *entities.Session) *common.SessionResult {

	if session == nil {
		return nil
	}

	return &common.SessionResult{
		ID:        session.ID,
		UserID:    session.UserID,
		Token:     session.Token,
		ExpiresAt: session.ExpiresAt,
		IPAddress: session.IPAddress,
		UserAgent: session.UserAgent,
		CreatedAt: session.CreatedAt,
		UpdatedAt: session.UpdatedAt,
	}

}

func NewSessionListResultFromSession(sessions []*entities.Session) []*common.SessionResult {

	sessionResults := make([]*common.SessionResult, len(sessions))

	for i := 0; i < len(sessions); i++ {
		sessionResults[i] = NewSessionResultFromSession(sessions[i])
	}

	return sessionResults

}
