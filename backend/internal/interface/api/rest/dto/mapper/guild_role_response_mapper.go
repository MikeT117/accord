package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToGuildRoleResponse(role *common.GuildRoleResult) *response.GuildRoleResponse {
	if role == nil {
		return nil
	}
	return &response.GuildRoleResponse{
		ID:          role.ID,
		GuildID:     role.GuildID,
		Name:        role.Name,
		Permissions: role.Permissions,
		CreatedAt:   role.CreatedAt.Unix(),
		UpdatedAt:   role.UpdatedAt.Unix(),
	}
}

func ToGuildRolesResponse(roles []*common.GuildRoleResult) []*response.GuildRoleResponse {
	roleResponses := make([]*response.GuildRoleResponse, len(roles))

	for i := 0; i < len(roles); i++ {
		roleResponses[i] = ToGuildRoleResponse(roles[i])
	}

	return roleResponses
}
