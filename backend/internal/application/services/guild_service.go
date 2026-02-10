package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type GuildService struct {
	transactor            *db.Transactor
	authorisationService  interfaces.AuthorisationService
	eventService          interfaces.EventService
	guildRepository       repositories.GuildRepository
	guildMemberRepository repositories.GuildMemberRepository
	guildRoleRepository   repositories.GuildRoleRepository
	channelRepository     repositories.ChannelRepository
	voiceStateRepository  repositories.VoiceStateRepository
	userRepository        repositories.UserRepository
}

func CreateGuildService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, eventService interfaces.EventService, guildRepository repositories.GuildRepository, guildMemberRepository repositories.GuildMemberRepository, guildRoleRepository repositories.GuildRoleRepository, channelRepository repositories.ChannelRepository, voiceStateRepository repositories.VoiceStateRepository, userRepository repositories.UserRepository) interfaces.GuildService {
	return &GuildService{
		transactor:            transactor,
		authorisationService:  authorisationService,
		eventService:          eventService,
		guildRepository:       guildRepository,
		guildMemberRepository: guildMemberRepository,
		guildRoleRepository:   guildRoleRepository,
		channelRepository:     channelRepository,
		voiceStateRepository:  voiceStateRepository,
		userRepository:        userRepository,
	}
}

func (s *GuildService) GetDiscoverableGuilds(ctx context.Context, qry *query.DiscoverableGuildsQuery) (*query.DiscoverableGuildsQueryResult, error) {
	guilds, err := s.guildRepository.GetDiscoverable(ctx)
	if err != nil {
		return nil, err
	}

	return &query.DiscoverableGuildsQueryResult{
		Result: mapper.NewDiscoverableGuildListResultFromGuild(guilds),
	}, nil

}

func (s *GuildService) Create(ctx context.Context, cmd *command.CreateGuildCommand) error {
	guild, err := entities.NewGuild(cmd.CreatorID, cmd.Name, cmd.IconID)
	if err != nil {
		return err
	}

	guildMember, err := entities.NewGuildMember(cmd.CreatorID, guild.ID, nil, nil)
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

	return s.transactor.WithinTransaction(ctx, func(ctx context.Context) error {

		err = s.guildRepository.Create(ctx, guild)
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

		err = s.guildMemberRepository.Create(ctx, guildMember)
		if err != nil {
			return err
		}

		return s.eventService.GuildCreated(ctx, guild.ID, cmd.CreatorID)
	})
}

func (s *GuildService) Update(ctx context.Context, cmd *command.UpdateGuildCommand) error {
	err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.ID, cmd.RequestorID, constants.GUILD_OWNER_PERMISSION)
	if err != nil {
		return err
	}

	guild, err := s.guildRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := guild.UpdateGuildCategoryID(cmd.GuildCategoryID); err != nil {
		return err
	}
	if err := guild.UpdateName(cmd.Name); err != nil {
		return err
	}
	if err := guild.UpdateDescription(cmd.Description); err != nil {
		return err
	}
	if err := guild.UpdateDiscoverable(cmd.Discoverable); err != nil {
		return err
	}
	if err := guild.UpdateIconID(cmd.IconID); err != nil {
		return err
	}
	if err := guild.UpdateBannerID(cmd.BannerID); err != nil {
		return err
	}

	if err := s.guildRepository.Update(ctx, guild); err != nil {
		return err
	}

	return s.eventService.GuildUpdated(ctx, guild.ID)
}

func (s *GuildService) Delete(ctx context.Context, cmd *command.DeleteGuildCommand) error {
	guild, err := s.guildRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if !guild.IsOwner(cmd.RequestorID) {
		err := s.authorisationService.VerifyUserGuildPermission(ctx, cmd.ID, cmd.RequestorID, constants.GUILD_OWNER_PERMISSION)
		if err != nil {
			return err
		}
	}

	roleID, err := s.guildRoleRepository.GetDefaultGuildRoleIDByGuildID(ctx, guild.ID)
	if err != nil {
		return err
	}
	if err := s.guildRepository.Delete(ctx, cmd.ID); err != nil {
		return err
	}

	return s.eventService.GuildDeleted(ctx, guild.ID, roleID)
}
