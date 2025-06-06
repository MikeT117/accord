package interfaces

type AuthorisationService interface {
	HasGuildPermission(guildID string, userID string, permission int)
	HasChannelPermission(channel string, userID string, permission int)
}
