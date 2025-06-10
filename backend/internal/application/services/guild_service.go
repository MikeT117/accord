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
	transactor            *db.Transactor
	guildRepository       db.GuildRepository
	guildMemberRepository db.GuildMemberRepository
	guildRoleRepository   db.GuildRoleRepository
	channelRepository     db.ChannelRepository
}

func CreateGuildService(transactor *db.Transactor, guildRepository db.GuildRepository, guildMemberRepository db.GuildMemberRepository, guildRoleRepository db.GuildRoleRepository, channelRepository db.ChannelRepository) interfaces.GuildService {
	return &GuildService{
		transactor:            transactor,
		guildRepository:       guildRepository,
		guildMemberRepository: guildMemberRepository,
		guildRoleRepository:   guildRoleRepository,
		channelRepository:     channelRepository,
	}
}

func (s *GuildService) GetByID(ctx context.Context, ID string) (*query.GuildQueryResult, error) {
	guild, err := s.guildRepository.GetByID(ctx, ID)
	if err != nil {
		return nil, err
	}

	roles, _, err := s.guildRoleRepository.GetByGuildID(ctx, ID)
	if err != nil {
		return nil, err
	}

	channels, channelIDs, err := s.channelRepository.GetByGuildID(ctx, ID)
	if err != nil {
		return nil, err
	}

	channelRoles, err := s.guildRoleRepository.GetRoleIDsByChannelIDs(ctx, channelIDs)
	if err != nil {
		return nil, err
	}

	return &query.GuildQueryResult{
		Result: mapper.NewGuildResultFromGuild(guild, channels, channelRoles, roles),
	}, nil
}

func (s *GuildService) GetByUserID(ctx context.Context, userID string) (*query.GuildQueryListResult, error) {

	guildIDs, err := s.guildMemberRepository.GetGuildIDsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if len(guildIDs) == 0 {
		return &query.GuildQueryListResult{Result: []*common.GuildResult{}}, nil
	}

	guilds, err := s.guildRepository.GetByGuildIDs(ctx, guildIDs)
	if err != nil {
		return nil, err
	}

	guildChannelsMap, channelIDs, err := s.channelRepository.GetByGuildIDs(ctx, guildIDs)
	if err != nil {
		return nil, err
	}

	guildChannelRolesMap, err := s.guildRoleRepository.GetRoleIDsByChannelIDs(ctx, channelIDs)
	if err != nil {
		return nil, err
	}

	rolesMap, _, err := s.guildRoleRepository.GetByGuildIDs(ctx, guildIDs)
	if err != nil {
		return nil, err
	}

	guildsLen := len(guilds)
	guildsResult := &query.GuildQueryListResult{
		Result: make([]*common.GuildResult, guildsLen),
	}

	for i := 0; i < guildsLen; i++ {
		guildsResult.Result[i] = mapper.NewGuildResultFromGuild(
			guilds[i],
			guildChannelsMap[guilds[i].ID],
			guildChannelRolesMap,
			rolesMap[guilds[i].ID],
		)
	}

	return guildsResult, nil
}

func (s *GuildService) Create(ctx context.Context, cmd *command.CreateGuildCommand) error {

	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {

		guild, err := entities.NewGuild(cmd.CreatorID, cmd.Name, cmd.Description, cmd.Discoverable, cmd.IconID, cmd.BannerID)
		if err != nil {
			return err
		}

		err = s.guildRepository.Create(ctx, guild)
		if err != nil {
			return err
		}

		ownerGuildRole, err := entities.NewOwnerGuildRole(guild.ID)
		if err != nil {
			return err
		}

		defaultGuildRole, err := entities.NewDefaultGuildRole(guild.ID)
		if err != nil {
			return err
		}

		err = s.guildRoleRepository.Create(ctx, ownerGuildRole)
		if err != nil {
			return err
		}

		err = s.guildRoleRepository.Create(ctx, defaultGuildRole)
		if err != nil {
			return err
		}

		if err := s.guildRoleRepository.AssociateUser(ctx, ownerGuildRole.ID, cmd.CreatorID); err != nil {
			return err
		}

		if err := s.guildRoleRepository.AssociateUser(ctx, defaultGuildRole.ID, cmd.CreatorID); err != nil {
			return err
		}

		guildMember, err := entities.NewGuildMember(cmd.CreatorID, guild.ID, nil, nil)
		if err != nil {
			return err
		}

		err = s.guildMemberRepository.Create(ctx, guildMember)
		if err != nil {
			return err
		}

		return nil
	})
}

func (s *GuildService) Update(ctx context.Context, cmd *command.UpdateGuildCommand) error {
	guild, err := s.guildRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	guild.UpdateGuildCategoryID(cmd.GuildCategoryID)
	guild.UpdateName(cmd.Name)
	guild.UpdateDescription(cmd.Description)
	guild.UpdateDiscoverable(cmd.Discoverable)
	guild.UpdateIconID(&cmd.IconID)
	guild.UpdateBannerID(&cmd.BannerID)

	return s.guildRepository.Update(ctx, guild)
}

func (s *GuildService) Delete(ctx context.Context, ID string, userID string) error {
	return s.guildRepository.Delete(ctx, ID)
}
