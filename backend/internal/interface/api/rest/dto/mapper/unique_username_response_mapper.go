package mapper

import (
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToUniqueUsernameResponse(available bool) *response.UniqueUsernameResponse {
	return &response.UniqueUsernameResponse{
		Available: available,
	}
}
