package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToSessionResponse(session *common.SessionResult) *response.SessionResponse {
	if session == nil {
		return nil
	}
	return &response.SessionResponse{
		ID:        session.ID,
		UserID:    session.UserID,
		Token:     session.Token,
		IPAddress: session.IPAddress,
		UserAgent: session.UserAgent,
		CreatedAt: session.CreatedAt,
		UpdatedAt: session.UpdatedAt,
	}
}

func ToSessionsResponse(sessions []*common.SessionResult) []*response.SessionResponse {
	sessionResponses := make([]*response.SessionResponse, len(sessions))

	for i := 0; i < len(sessions); i++ {
		sessionResponses[i] = ToSessionResponse(sessions[i])
	}

	return sessionResponses
}
