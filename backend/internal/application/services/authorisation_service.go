package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/google/uuid"
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

func (s *AuthorisationService) VerifyUserRelationship(ctx context.Context, requestorID uuid.UUID, userIDs []uuid.UUID, isBlocked bool, isFriend bool, isPending bool) error {
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

func (s *AuthorisationService) VerifyRelationship(ctx context.Context, requestorID uuid.UUID, userID uuid.UUID, isBlocked bool, isFriend bool, isPending bool) error {
	relationships, err := s.RelationshipRepository.GetByUserIDAndUserIDs(ctx, requestorID, []uuid.UUID{userID})

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

func (s *AuthorisationService) VerifyGuildMember(ctx context.Context, guildID uuid.UUID, requestorID uuid.UUID) error {
	_, err := s.guildMemberRepository.GetByID(ctx, requestorID, guildID)

	if err != nil {
		if domain.IsDomainNotFoundErr(err) {
			return ErrNotAuthorised
		}

		return err
	}

	return nil
}

func (s *AuthorisationService) VerifyPrivateChannelMember(ctx context.Context, channelID uuid.UUID, requestorID uuid.UUID) error {
	err := s.channelRepository.VerifyUserChannelMembership(ctx, requestorID, channelID)
	if err == nil {
		return nil
	}

	return err
}

func (s *AuthorisationService) VerifyUserGuildPermission(ctx context.Context, guildID uuid.UUID, requestorID uuid.UUID, permissionOffset int) error {
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

func (s *AuthorisationService) VerifyGuildChannelPermission(ctx context.Context, channelID uuid.UUID, requestorID uuid.UUID, permissionOffset int) error {
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
