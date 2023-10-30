package goverter

import (
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
)

// goverter:converter
// goverter:output:package github.com/MikeT117/accord/backend/internal/mapper:mapper
// goverter:output:file @cwd/../mapper/generated.go
// goverter:skipCopySameType
// goverter:extend PGTypeTimestampToTime
// goverter:extend ConvertPGTypeUUIDToUUID
// goverter:extend PGTypeUUIDToNullableUUID
// goverter:extend ConvertPGTypeTextToNullableString
// goverter:extend ConvertPGTypeTimestampToNullableTime
type Converter interface {
	// goverter:map . Author | ConvertGetManyChannelMessagesByChannelIDRowToAuthor
	ConvertSQLCGetManyChannelMessagesByChannelIDRowToMessage(source sqlc.GetManyChannelMessagesByChannelIDRow) models.ChannelMessage
	ConvertSQLCGetManyChannelMessagesByChannelIDRowsToManyMessage(source []sqlc.GetManyChannelMessagesByChannelIDRow) []models.ChannelMessage

	// goverter:map . Author | ConvertCreateChannelMessageRowToAuthor
	ConvertSQLCCreateChannelMessageRowToMessage(source sqlc.CreateChannelMessageRow) models.ChannelMessage

	ConvertSQLCUpdateChannelMessageRowUpdatedMessage(source sqlc.UpdateChannelMessageRow) models.UpdatedChannelMessage

	// goverter:ignore Roles
	ConvertSQLCChannelToGuildChannel(source sqlc.Channel) models.GuildChannel

	ConvertManySQLCGuildInviteToGuildInvite(source []sqlc.GuildInvite) []models.GuildInvite
	ConvertSQLCGuildInviteToGuildInvite(source sqlc.GuildInvite) models.GuildInvite

	// goverter:map AttachmentID Avatar
	// goverter:map . GuildMember
	ConvertSQLCGetUserProfileByIDAndGuildIDRowToUserProfileWithGuildMember(source sqlc.GetUserProfileByIDAndGuildIDRow) models.UserProfileWithGuildMember

	// goverter:map AttachmentID Avatar
	ConvertSQLCGetUserProfileByIDRowToUserProfile(source sqlc.GetUserProfileByIDRow) models.UserProfile

	// goverter:map . User | GetManyGuildMembersByGuildIDRowToUser
	ConvertSQLCGetManyGuildMembersByGuildIDRowToGuildMember(source sqlc.GetManyGuildMembersByGuildIDRow) models.GuildMemberLimited
	ConvertSQLCGetManyGuildMembersByGuildIDRowToGuildMembers(source []sqlc.GetManyGuildMembersByGuildIDRow) []models.GuildMemberLimited

	// goverter:map . User | GetManyGuildBansByGuildIDRowToUser
	ConvertSQLCGetManyGuildBansByGuildIDRowToGuildBan(source sqlc.GetManyGuildBansByGuildIDRow) models.GuildBan
	ConvertSQLCGetManyGuildBansByGuildIDRowToGuildBans(source []sqlc.GetManyGuildBansByGuildIDRow) []models.GuildBan

	ConvertSQLCGuildRoleToGuildRoles(source []sqlc.GuildRole) []models.GuildRole
	ConvertSQLCGuildRoleToGuildRole(source sqlc.GuildRole) models.GuildRole

	ConvertGetManyDiscoverableGuildsRowToDiscoverableGuild(source sqlc.GetManyDiscoverableGuildsRow) models.DiscoverableGuild
	ConvertGetManyDiscoverableGuildsRowToDiscoverableGuilds(source []sqlc.GetManyDiscoverableGuildsRow) []models.DiscoverableGuild

	// goverter:ignore Icon
	// goverter:ignore Banner
	// goverter:ignore Roles
	// goverter:ignore Channels
	// goverter:ignore Member
	ConvertSQLCGuildToGuild(source sqlc.Guild) models.Guild

	// goverter:ignore User
	// goverter:ignore Roles
	ConvertSQLCGuildMemberToGuildMember(source sqlc.GuildMember) models.GuildMember
	// goverter:map AttachmentID Avatar
	ConvertGetUserByIDRowToUser(source sqlc.GetUserByIDRow) models.UserLimited

	ConvertSQLUpdateGuildRowToUpdatedGuild(source sqlc.UpdateGuildRow) models.UpdatedGuild

	ConvertSQLCGuildCategoryToGuildCategory(source sqlc.GuildCategory) sqlc.GuildCategory
	ConvertSQLCGuildCategoryToGuildCategories(source []sqlc.GuildCategory) []sqlc.GuildCategory

	// goverter:ignore Recipients
	ConvertSQLCChannelToDirectChannel(source sqlc.Channel) models.DirectChannel

	// goverter:map AttachmentID Avatar
	ConvertSQLCGetManyUsersByIDsRowToUser(source sqlc.GetManyUsersByIDsRow) models.UserLimited
	ConvertSQLCGetManyUsersByIDsRowToUsers(source []sqlc.GetManyUsersByIDsRow) []models.UserLimited

	ConverSQLCUserSessionsToUserSession(source sqlc.UserSession) models.UserSession
	ConverSQLCUserSessionsToUserSessions(source []sqlc.UserSession) []models.UserSession
}
