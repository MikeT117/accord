package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

func NewGuildMemberUserResultFromGuildMember(guildMember *entities.GuildMember, roleIDs []uuid.UUID, user *entities.User) *common.GuildMemberUserResult {
	if guildMember == nil {
		return nil
	}

	return &common.GuildMemberUserResult{
		GuildMember: NewGuildMemberResultFromGuildMember(guildMember, roleIDs),
		User:        NewUserResultFromUser(user),
	}

}

func NewGuildMemberUserListResultFromGuildMember(guildMembers []*entities.GuildMember, roles map[uuid.UUID][]uuid.UUID, users map[uuid.UUID]*entities.User) []*common.GuildMemberUserResult {
	guildMemberResults := make([]*common.GuildMemberUserResult, len(guildMembers))

	for i := 0; i < len(guildMembers); i++ {
		guildMemberResults[i] = NewGuildMemberUserResultFromGuildMember(guildMembers[i], roles[guildMembers[i].UserID], users[guildMembers[i].UserID])
	}

	return guildMemberResults
}
