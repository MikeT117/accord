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

type VoiceStateService struct {
	transactor           *db.Transactor
	authorisationService interfaces.AuthorisationService
	voiceStateRepository repositories.VoiceStateRepository
	userRepository       repositories.UserRepository
}

func CreateVoiceStateService(transactor *db.Transactor, authorisationService interfaces.AuthorisationService, voiceStateRepository repositories.VoiceStateRepository, userRepository repositories.UserRepository) interfaces.VoiceStateService {
	return &VoiceStateService{
		transactor:           transactor,
		authorisationService: authorisationService,
		voiceStateRepository: voiceStateRepository,
		userRepository:       userRepository,
	}
}

func (s *VoiceStateService) GetByGuildID(ctx context.Context, guildID string, requestorID string) (*query.VoiceStateQueryListResult, error) {
	err := s.authorisationService.VerifyGuildMember(ctx, guildID, requestorID)
	if err != nil {
		return nil, err
	}

	voiceStates, userIDs, err := s.voiceStateRepository.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	usersMap, err := s.userRepository.GetMapByIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	return &query.VoiceStateQueryListResult{
		Result: mapper.NewVoiceStateListResultFromVoiceState(voiceStates, usersMap),
	}, nil

}
func (s *VoiceStateService) Create(ctx context.Context, cmd *command.CreateVoiceStateCommand) error {
	err := s.authorisationService.VerifyGuildMember(ctx, *cmd.GuildID, cmd.UserID)
	if err != nil {
		return err
	}

	voiceState, err := entities.NewVoiceState(cmd.UserID, cmd.ChannelID, cmd.GuildID)
	if err != nil {
		return err
	}

	if err := s.voiceStateRepository.Create(ctx, voiceState); err != nil {
		return err
	}

	return nil
}
func (s *VoiceStateService) Update(ctx context.Context, cmd *command.UpdateVoiceStateCommand) error {
	err := s.authorisationService.VerifyGuildMember(ctx, cmd.GuildID, cmd.RequestorID)
	if err != nil {
		return err
	}

	voiceState, err := s.voiceStateRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := voiceState.UpdateSelfDeaf(cmd.SelfDeaf); err != nil {
		return err
	}
	if err := voiceState.UpdateSelfMute(cmd.SelfMute); err != nil {
		return err
	}
	if err := s.voiceStateRepository.Update(ctx, voiceState); err != nil {
		return err
	}

	return nil
}
func (s *VoiceStateService) Delete(ctx context.Context, cmd *command.DeleteVoiceStateCommand) error {
	voiceState, err := s.voiceStateRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if !voiceState.IsOwner(cmd.RequestorID) {
		err := s.authorisationService.VerifyUserChannelPermission(ctx, voiceState.ChannelID, cmd.RequestorID, constants.MANAGE_GUILD_PERMISSION)
		if err != nil {
			return err
		}
	}

	if err := s.voiceStateRepository.Delete(ctx, cmd.ID); err != nil {
		return err
	}

	return nil
}
