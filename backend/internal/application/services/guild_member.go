package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type GuildMemberService struct {
	transactor            *db.Transactor
	guildMemberRepository *db.GuildMemberRepository
	guildRoleRepository   *db.GuildRoleRepository
}

func CreateGuildMemberService(transactor *db.Transactor, guildMemberRepository *db.GuildMemberRepository, guildRoleRepository *db.GuildRoleRepository) interfaces.GuildMemberService {
	return &GuildMemberService{
		transactor:            transactor,
		guildMemberRepository: guildMemberRepository,
		guildRoleRepository:   guildRoleRepository,
	}
}

func (s *GuildMemberService) GetByID(ctx context.Context, ID string, guildID string) (*query.GuildMemberQueryResult, error) {
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

func (s *GuildMemberService) GetByGuildID(ctx context.Context, guildID string) (*query.GuildMemberQueryListResult, error) {
	guildMembers, guildMemberIDs, err := s.guildMemberRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	guildMembersRoles, err := s.guildRoleRepository.GetRoleIDsByUserIDs(ctx, guildMemberIDs)
	if err != nil {
		return nil, err
	}

	return &query.GuildMemberQueryListResult{
		Result: mapper.NewGuildMemberListResultFromGuildMember(guildMembers, guildMembersRoles),
	}, nil
}

func (s *GuildMemberService) Create(ctx context.Context, cmd *command.CreateGuildMemberCommand) error {
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

func (s *GuildMemberService) Update(ctx context.Context, cmd *command.UpdateGuildMemberCommand) error {
	guildMember, err := s.guildMemberRepository.GetByID(ctx, cmd.UserID, cmd.GuildID)
	if err != nil {
		return err
	}

	guildMember.UpdateAvatarID(cmd.AvatarID)
	guildMember.UpdateBannerID(cmd.BannerID)
	guildMember.UpdateNickname(cmd.Nickname)
	return s.guildMemberRepository.Update(ctx, guildMember)
}
func (s *GuildMemberService) Delete(ctx context.Context, ID string, guildID string) error {
	return s.guildMemberRepository.Delete(ctx, ID)
}
