package services

import (
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type AuthorisationService struct {
	guildRole *db.GuildRoleRepository
}

func CreateAuthorisationService(guildRole *db.GuildRoleRepository) interfaces.AuthorisationService {
	return &AuthorisationService{
		guildRole: guildRole,
	}
}

func (s *AuthorisationService) HasGuildPermission(guildID string, userID string, permission int) {
}

func (s *AuthorisationService) HasChannelPermission(channel string, userID string, permission int) {
}
