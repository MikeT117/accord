package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type GuildService struct {
	repositories *db.MasterRepository
}

func CreateGuildService(repositories *db.MasterRepository) interfaces.GuildService {
	return &GuildService{
		repositories: repositories,
	}
}

func (s *GuildService) GetByUserID(ctx context.Context, userID string) (_ *query.GuildQueryListResult, err error) {

	guildIDs, err := s.repositories.GuildMemberRepository.GetGuildIDsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if len(guildIDs) == 0 {
		return &query.GuildQueryListResult{Result: []*common.GuildResult{}}, nil
	}

	guilds, err := s.repositories.GuildRepository.GetByGuildIDs(ctx, guildIDs)
	if err != nil {
		return nil, err
	}

	guildChannelsMap, channelIDs, err := s.repositories.ChannelRepository.GetByGuildIDs(ctx, guildIDs)
	if err != nil {
		return nil, err
	}

	guildChannelRolesMap, err := s.repositories.GuildRoleChannelRepository.GetRoleIDsByChannelIDs(ctx, channelIDs)
	if err != nil {
		return nil, err
	}

	rolesMap, _, err := s.repositories.GuildRoleRepository.GetByGuildIDs(ctx, guildIDs)
	if err != nil {
		return nil, err
	}

	guildsLen := len(guilds)
	guildsResult := &query.GuildQueryListResult{
		Result: make([]*common.GuildResult, guildsLen),
	}

	for i := 0; i < guildsLen; i++ {
		guildsResult.Result[i] = mapper.ExistingGuildResultFromGuild(
			guilds[i],
			guildChannelsMap[guilds[i].ID],
			guildChannelRolesMap,
			rolesMap[guilds[i].ID],
		)
	}

	return guildsResult, nil
}

func (s *GuildService) Create(ctx context.Context, createCommand *command.CreateGuildCommand) (_ *command.CreateGuildCommandResult, err error) {
	user, err := s.repositories.UserRepository.GetByID(ctx, createCommand.CreatorID)
	if err != nil {
		return nil, err
	}

	guildEntity, err := entities.NewGuild(createCommand.CreatorID, createCommand.Name, createCommand.Discoverable, createCommand.IconID, createCommand.BannerID)
	if err != nil {
		return nil, err
	}
	validatedGuildEntity, err := entities.NewValidatedGuild(guildEntity)
	if err != nil {
		return nil, err
	}

	tx, err := s.repositories.DB.Begin(ctx)
	if err != nil {
		return nil, err
	}

	txRepositories := s.repositories.WithTx(tx)

	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	guild, err := txRepositories.GuildRepository.Create(ctx, validatedGuildEntity)
	if err != nil {
		return nil, err
	}

	guildRoles, err := createDefaultRoles(ctx, txRepositories, guild.ID, user.ID)
	if err != nil {
		return nil, err
	}

	_, err = createDefaultMember(ctx, txRepositories, guild.ID, user.ID)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &command.CreateGuildCommandResult{
		Result: mapper.NewGuildResultFromGuild(
			guild,
			guildRoles,
		),
	}, nil
}

func (s *GuildService) Update(ctx context.Context, updateCommand *command.UpdateGuildCommand) error {

	guild, err := s.repositories.GuildRepository.GetByID(ctx, updateCommand.ID)
	if err != nil {
		return err
	}

	guildEntity, err := entities.UpdateGuild(guild.ID, guild.CreatorID, updateCommand.GuildCategoryID, updateCommand.Name, updateCommand.Description, updateCommand.Discoverable, guild.ChannelCount, guild.MemberCount, guild.CreatedAt, &updateCommand.IconID, &updateCommand.BannerID)
	if err != nil {
		return err
	}

	validatedGuildEntity, err := entities.NewValidatedGuild(guildEntity)
	if err != nil {
		return err
	}

	_, err = s.repositories.GuildRepository.Update(ctx, validatedGuildEntity)
	if err != nil {
		return err
	}

	return nil
}

func (s *GuildService) Delete(ctx context.Context, ID string, userID string) error {
	return s.repositories.GuildRepository.Delete(ctx, ID)
}

func createDefaultMember(ctx context.Context, repositories *db.MasterRepository, guildID string, userID string) (*entities.GuildMember, error) {
	guildMemberEntity, err := entities.NewGuildMember(userID, guildID, nil, nil)
	if err != nil {
		return nil, err
	}
	validatedGuildMemberEntity, err := entities.NewValidatedGuildMember(guildMemberEntity)
	if err != nil {
		return nil, err
	}

	guildMember, err := repositories.GuildMemberRepository.Create(ctx, validatedGuildMemberEntity)
	if err != nil {
		return nil, err
	}

	return guildMember, nil
}

func createDefaultRoles(ctx context.Context, repositories *db.MasterRepository, guildID string, userID string) ([]*entities.GuildRole, error) {

	ownerGuildRoleEntity, err := entities.NewOwnerGuildRole(guildID)
	if err != nil {
		return []*entities.GuildRole{}, err
	}
	validatedOwnerGuildRoleEntity, err := entities.NewValidatedGuildRole(ownerGuildRoleEntity)
	if err != nil {
		return []*entities.GuildRole{}, err
	}

	defaultGuildRoleEntity, err := entities.NewDefaultGuildRole(guildID)
	if err != nil {
		return []*entities.GuildRole{}, err
	}
	validatedDefaultGuildRoleEntity, err := entities.NewValidatedGuildRole(defaultGuildRoleEntity)
	if err != nil {
		return []*entities.GuildRole{}, err
	}

	ownerGuildRole, err := repositories.GuildRoleRepository.Create(ctx, validatedOwnerGuildRoleEntity)
	if err != nil {
		return []*entities.GuildRole{}, err
	}

	defaultGuildRole, err := repositories.GuildRoleRepository.Create(ctx, validatedDefaultGuildRoleEntity)
	if err != nil {
		return []*entities.GuildRole{}, err
	}

	if err := repositories.GuildRoleUserRepository.CreateAssoc(ctx, ownerGuildRole.ID, userID); err != nil {
		return nil, err
	}

	if err := repositories.GuildRoleUserRepository.CreateAssoc(ctx, defaultGuildRole.ID, userID); err != nil {
		return nil, err
	}

	return []*entities.GuildRole{ownerGuildRole, defaultGuildRole}, nil
}
