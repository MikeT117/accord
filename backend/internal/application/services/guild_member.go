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
	repositories *db.MasterRepository
}

func CreateGuildMemberUserService(repositories *db.MasterRepository) interfaces.GuildMemberService {
	return &GuildMemberService{
		repositories: repositories,
	}
}

func (s *GuildMemberService) GetByID(ctx context.Context, ID string, guildID string) (*query.GuildMemberQueryResult, error) {
	guildMember, err := s.repositories.GuildMemberRepository.GetByID(ctx, ID, guildID)
	if err != nil {
		return nil, err
	}

	guildMemberRoles, err := s.repositories.GuildRoleUserRepository.GetAssocsByUserIDAndGuildID(ctx, guildMember.UserID, guildMember.GuildID)
	if err != nil {
		return nil, err
	}

	return &query.GuildMemberQueryResult{
		Result: mapper.NewGuildMemberResultFromGuildMember(guildMember, guildMemberRoles),
	}, nil
}
func (s *GuildMemberService) GetByGuildID(ctx context.Context, guildID string) (*query.GuildMemberQueryListResult, error) {
	guildMembers, guildMemberIDs, err := s.repositories.GuildMemberRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	guildMembersRoles, err := s.repositories.GuildRoleUserRepository.GetAssocsByUserIDs(ctx, guildMemberIDs)
	if err != nil {
		return nil, err
	}

	return &query.GuildMemberQueryListResult{
		Result: mapper.NewGuildMemberListResultFromGuildMember(guildMembers, guildMembersRoles),
	}, nil
}
func (s *GuildMemberService) Create(ctx context.Context, createCommand *command.CreateGuildMemberCommand) (_ *command.CreateGuildMemberCommandResult, err error) {
	guildMemberEntity, err := entities.NewGuildMember(createCommand.UserID, createCommand.GuildID, nil, nil)
	if err != nil {
		return nil, err
	}

	validatedGuildMemberEntity, err := entities.NewValidatedGuildMember(guildMemberEntity)
	if err != nil {
		return nil, err
	}

	tx, err := s.repositories.DB.Begin(ctx)
	if err != nil {
		return nil, err
	}

	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	defaultGuildRole, err := s.repositories.GuildRoleRepository.GetByNameAndGuildID(ctx, "@default", createCommand.GuildID)
	if err != nil {
		return nil, err
	}

	txRepositories := s.repositories.WithTx(tx)

	guildMember, err := txRepositories.GuildMemberRepository.Create(ctx, validatedGuildMemberEntity)
	if err != nil {
		return nil, err
	}

	err = txRepositories.GuildRoleUserRepository.CreateAssoc(ctx, defaultGuildRole.ID, guildMember.UserID)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &command.CreateGuildMemberCommandResult{
		Result: mapper.NewGuildMemberResultFromGuildMember(guildMember, []string{defaultGuildRole.ID}),
	}, nil
}

func (s *GuildMemberService) Update(ctx context.Context, updateCommand *command.UpdateGuildMemberCommand) error {
	currentGuildMember, err := s.repositories.GuildMemberRepository.GetByID(ctx, updateCommand.UserID, updateCommand.GuildID)
	if err != nil {
		return err
	}

	guildMembereEntity, err := entities.UpdateGuildMember(currentGuildMember.UserID, currentGuildMember.GuildID, updateCommand.AvatarID, updateCommand.BannerID, currentGuildMember.CreatedAt)
	if err != nil {
		return err
	}

	validatedGuildMemberEntity, err := entities.NewValidatedGuildMember(guildMembereEntity)
	if err != nil {
		return err
	}

	_, err = s.repositories.GuildMemberRepository.Update(ctx, validatedGuildMemberEntity)
	if err != nil {
		return err
	}

	return nil
}
func (s *GuildMemberService) Delete(ctx context.Context, ID string, guildID string) error {
	return s.repositories.GuildMemberRepository.Delete(ctx, ID)
}
