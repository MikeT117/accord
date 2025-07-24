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

func (s *AuthorisationService) VerifyRelationships(ctx context.Context, requestorID string, userIDs []string, isBlocked bool, isFriend bool, isPending bool) error {
	relationships, err := s.RelationshipRepository.GetByUserIDAndUserIDs(ctx, requestorID, userIDs)

	if len(relationships) != len(userIDs) {
		return ErrNotAuthorised
	}

	for _, relationship := range relationships {
		switch {
		case !isBlocked && relationship.IsBlocked():
			return ErrNotAuthorised
		case isPending && !relationship.IsPending():
			return ErrNotAuthorised
		case isFriend && !relationship.IsFriend():
			return ErrNotAuthorised
		}
	}

	if err != nil {
		return err
	}

	return nil
}

func (s *AuthorisationService) VerifyRelationship(ctx context.Context, requestorID string, userID string, isBlocked bool, isFriend bool, isPending bool) error {
	relationships, err := s.RelationshipRepository.GetByUserIDAndUserIDs(ctx, requestorID, []string{userID})

	if len(relationships) != 1 {
		return ErrNotAuthorised
	}

	for _, relationship := range relationships {
		switch {
		case !isBlocked && relationship.IsBlocked():
			return ErrNotAuthorised
		case isPending && !relationship.IsPending():
			return ErrNotAuthorised
		case isFriend && !relationship.IsFriend():
			return ErrNotAuthorised
		}
	}

	if err != nil {
		return err
	}

	return nil
}

func (s *AuthorisationService) VerifyGuildMember(ctx context.Context, guildID, requestorID string) error {
	_, err := s.guildMemberRepository.GetByID(ctx, requestorID, guildID)

	if err != nil {
		if domain.IsDomainNotFoundErr(err) {
			return ErrNotAuthorised
		}

		return err
	}

	return nil
}

func (s *AuthorisationService) VerifyPrivateChannelMember(ctx context.Context, channelID, requestorID string) error {
	err := s.channelRepository.VerifyUserChannelMembership(ctx, channelID, requestorID)
	if err == nil {
		return nil
	}

	return err
}

func (s *AuthorisationService) VerifyUserGuildPermission(ctx context.Context, guildID string, requestorID string, permissionOffset int) error {
	permissions, err := s.guildRoleRepository.GetGuildPermissions(ctx, guildID, requestorID)

	if err != nil {
		if domain.IsDomainNotFoundErr(err) {
			return ErrNotAuthorised
		}
		return err
	}

	if permissions == -1 || permissions&(1<<permissionOffset) == 0 {
		return ErrNotAuthorised
	}

	return nil
}

func (s *AuthorisationService) VerifyGuildChannelPermission(ctx context.Context, channelID string, requestorID string, permissionOffset int) error {
	permissions, err := s.guildRoleRepository.GetChannelPermissions(ctx, channelID, requestorID)

	if err == nil {
		if permissions == -1 || permissions&(1<<permissionOffset) == 0 {
			return ErrNotAuthorised
		}
		return nil
	}

	if domain.IsDomainNotFoundErr(err) {
		return ErrNotAuthorised
	}

	return err
}
