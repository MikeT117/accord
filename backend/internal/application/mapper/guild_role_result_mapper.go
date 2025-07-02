package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func NewGuildRoleResultFromGuildRole(guildRole *entities.GuildRole) *common.GuildRoleResult {
	return &common.GuildRoleResult{
		ID:          guildRole.ID,
		GuildID:     guildRole.GuildID,
		Name:        guildRole.Name,
		Permissions: guildRole.Permissions,
		CreatedAt:   guildRole.CreatedAt,
		UpdatedAt:   guildRole.UpdatedAt,
	}
}

func NewGuildRoleListResultFromGuildRole(guildRoles []*entities.GuildRole) []*common.GuildRoleResult {
	guildRoleResults := make([]*common.GuildRoleResult, len(guildRoles))

	for i := 0; i < len(guildRoles); i++ {
		guildRoleResults[i] = NewGuildRoleResultFromGuildRole(guildRoles[i])
	}

	return guildRoleResults
}

func NewGuildRoleProtoResultFromGuildRole(guildRole *entities.GuildRole) *pb.GuildRole {
	var ver int32 = 0
	return &pb.GuildRole{
		Ver:         &ver,
		Id:          &guildRole.ID,
		GuildId:     &guildRole.GuildID,
		Name:        &guildRole.Name,
		Permissions: &guildRole.Permissions,
		CreatedAt:   timestamppb.New(guildRole.CreatedAt),
		UpdatedAt:   timestamppb.New(guildRole.UpdatedAt),
	}
}

func NewGuildRoleCreatedProtoEvent(guildRole *entities.GuildRole) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_GUILD_ROLE_CREATE_EVENT.Enum(),
		Payload: &pb.EventPayload_GuildRoleCreated{
			GuildRoleCreated: NewGuildRoleProtoResultFromGuildRole(guildRole),
		},
	}
}

func NewGuildRoleUpdatedProtoEvent(guildRole *entities.GuildRole) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_GUILD_ROLE_UPDATE_EVENT.Enum(),
		Payload: &pb.EventPayload_GuildRoleUpdated{
			GuildRoleUpdated: &pb.GuildRoleUpdated{
				Ver:         &ver,
				Id:          &guildRole.ID,
				GuildId:     &guildRole.GuildID,
				Name:        &guildRole.Name,
				Permissions: &guildRole.Permissions,
				UpdatedAt:   timestamppb.New(guildRole.UpdatedAt),
			},
		},
	}
}

func NewGuildRoleDeletedProtoEvent(ID string, guildID string) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_GUILD_ROLE_DELETE_EVENT.Enum(),
		Payload: &pb.EventPayload_GuildRoleDeleted{
			GuildRoleDeleted: &pb.GuildRoleDeleted{
				Ver:     &ver,
				Id:      &ID,
				GuildId: &guildID,
			},
		},
	}
}
