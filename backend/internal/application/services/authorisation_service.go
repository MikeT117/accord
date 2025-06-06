package services

import (
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type AuthorisationService struct {
	repositories *db.MasterRepository
}

func CreateAuthorisationService(repositories *db.MasterRepository) interfaces.AuthorisationService {
	return &AuthorisationService{
		repositories: repositories,
	}
}

func (s *AuthorisationService) HasGuildPermission(guildID string, userID string, permission int) {

}

func (s *AuthorisationService) HasChannelPermission(channel string, userID string, permission int) {

}
