package services

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type GuildMemberService struct {
	transactor            *db.Transactor
	authorisationService  interfaces.AuthorisationService
	guildRepository       repositories.GuildRepository
	guildMemberRepository repositories.GuildMemberRepository
	guildRoleRepository   repositories.GuildRoleRepository
	guildInviteRepository repositories.GuildInviteRepository
}

func CreateGuildMemberService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, guildMemberRepository repositories.GuildMemberRepository, guildRoleRepository repositories.GuildRoleRepository, guildRepository repositories.GuildRepository, guildInviteRepository repositories.GuildInviteRepository) interfaces.GuildMemberService {
	return &GuildMemberService{
		transactor:            transactor,
		authorisationService:  authorisationService,
		guildRepository:       guildRepository,
		guildMemberRepository: guildMemberRepository,
		guildRoleRepository:   guildRoleRepository,
		guildInviteRepository: guildInviteRepository,
	}
}

func (s *GuildMemberService) GetByID(ctx context.Context, ID string, guildID string, requestorID string) (*query.GuildMemberQueryResult, error) {
	err := s.authorisationService.VerifyGuildMember(ctx, guildID, requestorID)
	if err != nil {
		return nil, err
	}

	guildMember, err := s.guildMemberRepository.GetByID(ctx, ID, guildID)
	if err != nil {
		return nil, err
	}

	guildMemberRoles, err := s.guildRoleRepository.GetRoleIDsByUserIDAndGuildID(ctx, guildMember.UserID, guildMember.GuildID)
	if err != nil {
		return nil, err
	}

	return &query.GuildMemberQueryResult{
		Result: mapper.NewGuildMemberResultFromGuildMember(guildMember, guildMemberRoles),
	}, nil
}

func (s *GuildMemberService) GetByGuildID(ctx context.Context, guildID string, before time.Time, requestorID string) (*query.GuildMemberQueryListResult, error) {
	err := s.authorisationService.VerifyGuildMember(ctx, guildID, requestorID)
	if err != nil {
		return nil, err
	}

	guildMembers, guildMemberIDs, err := s.guildMemberRepository.GetByGuildID(ctx, guildID, before, 50)
	if err != nil {
		return nil, err
	}

	guildMembersRoles, err := s.guildRoleRepository.GetMapRoleIDsByUserIDs(ctx, guildMemberIDs)
	if err != nil {
		return nil, err
	}

	return &query.GuildMemberQueryListResult{
		Result: mapper.NewGuildMemberListResultFromGuildMember(guildMembers, guildMembersRoles),
	}, nil
}

func (s *GuildMemberService) Create(ctx context.Context, cmd *command.CreateGuildMemberCommand) error {
	guild, err := s.guildRepository.GetByID(ctx, cmd.GuildID)
	if err != nil {
		return err
	}

	if !guild.Discoverable {
		if cmd.InviteID == nil {
			return ErrNotAuthorised
		}

		invite, err := s.guildInviteRepository.GetByID(ctx, cmd.GuildID)
		if err != nil {
			return err
		}

		if time.Now().Unix() > invite.ExpiresAt.Unix() {
			return ErrNotAuthorised
		}
	}

	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {

		guildMember, err := entities.NewGuildMember(cmd.UserID, cmd.GuildID, nil, nil)
		if err != nil {
			return err
		}

		defaultGuildRole, err := s.guildRoleRepository.GetByNameAndGuildID(ctx, "@default", cmd.GuildID)
		if err != nil {
			return err
		}

		err = s.guildMemberRepository.Create(ctx, guildMember)
		if err != nil {
			return err
		}

		err = s.guildRoleRepository.AssociateUser(ctx, defaultGuildRole.ID, guildMember.UserID)
		if err != nil {
			return err
		}

		return nil
	})

}

func (s *GuildMemberService) Update(ctx context.Context, cmd *command.UpdateGuildMemberCommand, requestorID string) error {
	guildMember, err := s.guildMemberRepository.GetByID(ctx, cmd.UserID, cmd.GuildID)
	if err != nil {
		return err
	}

	if !guildMember.IsOwner(requestorID) {
		return ErrNotAuthorised
	}

	if err = guildMember.UpdateAvatarID(cmd.AvatarID); err != nil {
		return err
	}

	if err = guildMember.UpdateBannerID(cmd.BannerID); err != nil {
		return err
	}

	if err = guildMember.UpdateNickname(cmd.Nickname); err != nil {
		return err
	}

	if err := s.guildMemberRepository.Update(ctx, guildMember); err != nil {
		return err
	}

	return nil
}

func (s *GuildMemberService) Delete(ctx context.Context, ID string, guildID string, requestorID string) error {
	guildMember, err := s.guildMemberRepository.GetByID(ctx, ID, guildID)
	if err != nil {
		return err
	}

	if !guildMember.IsOwner(requestorID) {
		err := s.authorisationService.VerifyGuildMember(ctx, guildID, requestorID)
		if err != nil {
			return err
		}
	}

	if err := s.guildMemberRepository.Delete(ctx, ID); err != nil {
		return err
	}

	return nil
}
