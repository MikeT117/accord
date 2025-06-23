package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type AuthorisationService struct {
	guildRoleRepository    repositories.GuildRoleRepository
	channelRepository      repositories.ChannelRepository
	guildMemberRepository  repositories.GuildMemberRepository
	RelationshipRepository repositories.RelationshipRepository
}

func CreateAuthorisationService(guildRoleRepository repositories.GuildRoleRepository, channelRepository repositories.ChannelRepository, guildMemberRepository repositories.GuildMemberRepository, RelationshipRepository repositories.RelationshipRepository) interfaces.AuthorisationService {
	return &AuthorisationService{
		guildRoleRepository:    guildRoleRepository,
		channelRepository:      channelRepository,
		guildMemberRepository:  guildMemberRepository,
		RelationshipRepository: RelationshipRepository,
	}
}

func (s *AuthorisationService) VerifyFriendRelationships(ctx context.Context, userID string, userIDs []string) error {
	relationships, err := s.RelationshipRepository.GetByUserIDAndUserIDs(ctx, userID, userIDs)

	if len(relationships) != len(userIDs) {
		return ErrNotAuthorised
	}

	for _, relationship := range relationships {
		if !relationship.IsFriend() {
			return ErrNotAuthorised
		}
	}

	if err != nil {
		return err
	}

	return nil
}

func (s *AuthorisationService) VerifyNotBlockedRelationships(ctx context.Context, userID string, userIDs []string) error {
	relationships, err := s.RelationshipRepository.GetByUserIDAndUserIDs(ctx, userID, userIDs)

	if len(relationships) != len(userIDs) {
		return ErrNotAuthorised
	}

	for _, relationship := range relationships {
		if relationship.IsBlocked() {
			return ErrNotAuthorised
		}
	}

	if err != nil {
		return err
	}

	return nil
}

func (s *AuthorisationService) VerifyGuildMember(ctx context.Context, guildID, userID string) error {
	_, err := s.guildMemberRepository.GetByID(ctx, userID, guildID)

	if err != nil {
		if domain.IsDomainNotFoundErr(err) {
			return ErrNotAuthorised
		}

		return err
	}

	return nil
}

func (s *AuthorisationService) VerifyChannelMember(ctx context.Context, channelID, userID string) error {
	_, err := s.channelRepository.GetUserChannelPermission(ctx, channelID, userID)
	if err != nil {
		if domain.IsDomainNotFoundErr(err) {
			return ErrNotAuthorised
		}

		return err
	}

	return nil
}

func (s *AuthorisationService) VerifyUserGuildPermission(ctx context.Context, guildID string, userID string, permissionOffset int) error {
	permissions, err := s.guildRoleRepository.GetGuildPermissions(ctx, guildID, userID)

	if err != nil {
		if domain.IsDomainNotFoundErr(err) {
			return ErrNotAuthorised
		}
		return err
	}

	if permissions&(1<<permissionOffset) == 0 {
		return ErrNotAuthorised
	}

	return nil
}

func (s *AuthorisationService) VerifyUserChannelPermission(ctx context.Context, channelID string, userID string, permissionOffset int) error {
	permissions, err := s.guildRoleRepository.GetChannelPermissions(ctx, channelID, userID)
	if err == nil {
		if permissions&(1<<permissionOffset) == 0 {
			return ErrNotAuthorised
		}
		return nil
	}

	if domain.IsDomainNotFoundErr(err) {
		if _, err := s.channelRepository.GetUserChannelPermission(ctx, channelID, userID); err != nil {
			if domain.IsDomainNotFoundErr(err) {
				return ErrNotAuthorised
			}
			return err
		}
	}

	return nil
}
