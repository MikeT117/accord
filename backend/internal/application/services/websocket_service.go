package services

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"github.com/google/uuid"
)

type WebsocketService struct {
	userRepository         repositories.UserRepository
	sessionRepository      repositories.SessionRepository
	guildRepository        repositories.GuildRepository
	guildMemberRepository  repositories.GuildMemberRepository
	guildRoleRepository    repositories.GuildRoleRepository
	channelRepository      repositories.ChannelRepository
	relationshipRepository repositories.RelationshipRepository
	voiceStateRepository   repositories.VoiceStateRepository
}

func CreateWebsocketService(
	userRepository repositories.UserRepository,
	sessionRepository repositories.SessionRepository,
	guildRepository repositories.GuildRepository,
	guildMemberRepository repositories.GuildMemberRepository,
	guildRoleRepository repositories.GuildRoleRepository,
	channelRepository repositories.ChannelRepository,
	relationshipRepository repositories.RelationshipRepository,
	voiceStateRepository repositories.VoiceStateRepository,
) interfaces.WebsocketService {
	return &WebsocketService{
		userRepository:         userRepository,
		sessionRepository:      sessionRepository,
		guildRepository:        guildRepository,
		guildMemberRepository:  guildMemberRepository,
		guildRoleRepository:    guildRoleRepository,
		channelRepository:      channelRepository,
		relationshipRepository: relationshipRepository,
		voiceStateRepository:   voiceStateRepository,
	}
}

func (s *WebsocketService) GetInitialisationPayload(ctx context.Context, userID uuid.UUID) (*pb.Initialisation, error) {

	guildIDs, err := s.guildMemberRepository.GetGuildIDsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	guilds, err := s.guildRepository.GetByGuildIDs(ctx, guildIDs)
	if err != nil {
		return nil, err
	}

	guildChannelsMap, channelIDs, err := s.channelRepository.GetMapByGuildIDs(ctx, guildIDs)
	if err != nil {
		return nil, err
	}

	voiceStatesMap, voiceStateUserIDs, err := s.voiceStateRepository.GetMapByGuildIDs(ctx, guildIDs)
	if err != nil {
		return nil, err
	}

	voiceStateUsers, err := s.userRepository.GetMapByIDs(ctx, voiceStateUserIDs)
	if err != nil {
		return nil, err
	}

	voiceStateGuildMembers, err := s.guildMemberRepository.GetMapByIDsAndGuildIDs(ctx, voiceStateUserIDs, guildIDs)
	if err != nil {
		return nil, err
	}

	privateChannels, privateChannelIDs, err := s.channelRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	privateChannelUsers, err := s.channelRepository.GetMapUsersByChannelIDs(ctx, privateChannelIDs)
	if err != nil {
		return nil, err
	}

	relationships, relationshipUserIDs, err := s.relationshipRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	relationshipUsers, err := s.userRepository.GetMapByIDs(ctx, relationshipUserIDs)
	if err != nil {
		return nil, err
	}

	guildChannelRolesMap, err := s.guildRoleRepository.GetMapRoleIDsByChannelIDs(ctx, channelIDs)
	if err != nil {
		return nil, err
	}

	rolesMap, _, err := s.guildRoleRepository.GetMapByGuildIDs(ctx, guildIDs)
	if err != nil {
		return nil, err
	}

	user, err := s.userRepository.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	userRoleIDs, err := s.guildRoleRepository.GetRoleIDsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	var userRoleIDStrs []string
	for _, userRoleID := range userRoleIDs {
		userRoleIDStrs = append(userRoleIDStrs, userRoleID.String())
	}

	var ver int32 = 0
	return &pb.Initialisation{
		Ver:     &ver,
		User:    mapper.NewUserProtoResultFromUser(user),
		RoleIds: userRoleIDStrs,
		Guilds: mapper.NewGuildProtoListResultFromGuild(
			guilds,
			guildChannelsMap,
			guildChannelRolesMap,
			rolesMap,
			voiceStatesMap,
			voiceStateGuildMembers,
			voiceStateUsers,
		),
		PrivateChannels: mapper.NewChannelListProtoResultFromChannel(
			privateChannels,
			nil,
			privateChannelUsers,
		),
		Relationships: mapper.NewRelationshipListProtoResultFromRelationship(relationships, relationshipUsers),
	}, nil
}

func (s *WebsocketService) ValidateSession(ctx context.Context, token string) (bool, error) {
	session, err := s.sessionRepository.GetByToken(context.Background(), token)
	if err != nil {
		return false, err
	}

	if !session.ExpiresAt.After(time.Now()) {
		return false, nil
	}

	return true, nil
}

func (s *WebsocketService) GetUserRoleIDs(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	roleIDs, err := s.guildRoleRepository.GetRoleIDsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return roleIDs, nil
}
