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

	ConvertSQLCGetManyGuildChannelsByGuildIDRowToGuildChannel(source []sqlc.GetManyGuildChannelsByGuildIDRow) []models.GuildChannel

	ConvertSQLCChannelToUpdatedChannel(source sqlc.Channel) models.UpdatedChannel

	// goverter:map . Creator | ConvertGetManyGuildInvitesByGuildIDRowToGuildInviteToCreator
	ConvertSQLCGetManyGuildInvitesByGuildIDRowToGuildInvite(source sqlc.GetManyGuildInvitesByGuildIDRow) models.GuildInvite
	ConvertSQLCGetManyGuildInvitesByGuildIDRowToGuildInvites(source []sqlc.GetManyGuildInvitesByGuildIDRow) []models.GuildInvite

	ConvertSQLCGetGuildInviteByIDRowToGuildInviteLimited(source sqlc.GetGuildInviteByIDRow) models.GuildInviteLimited

	// goverter:map AttachmentID Avatar
	// goverter:map . GuildMember
	ConvertSQLCGetUserProfileByIDAndGuildIDRowToUserProfileWithGuildMember(source sqlc.GetUserProfileByIDAndGuildIDRow) models.UserProfileWithGuildMember

	// goverter:map AttachmentID Avatar
	ConvertSQLCGetUserProfileByIDRowToUserProfile(source sqlc.GetUserProfileByIDRow) models.UserProfile

	// goverter:map . User | GetManyGuildMembersByGuildIDRowToUser
	ConvertSQLCGetManyGuildMembersByGuildIDRowToGuildMember(source sqlc.GetManyGuildMembersByGuildIDRow) models.GuildMemberLimited
	ConvertSQLCGetManyGuildMembersByGuildIDRowToGuildMembers(source []sqlc.GetManyGuildMembersByGuildIDRow) []models.GuildMemberLimited

	// goverter:map . User | GetManyAssignableGuildMembersByGuildIDAndRoleIDRowToUser
	ConvertSQLCGetManyAssignableGuildMembersByRoleIDAndGuildIDRowToGuildMember(source sqlc.GetManyAssignableGuildMembersByGuildIDAndRoleIDRow) models.GuildMemberLimited
	ConvertSQLCGetManyAssignableGuildMembersByRoleIDAndGuildIDRowToGuildMembers(source []sqlc.GetManyAssignableGuildMembersByGuildIDAndRoleIDRow) []models.GuildMemberLimited

	// goverter:map . User | GetManyUnassignableGuildMembersByGuildIDAndRoleIDRowToUser
	ConvertSQLCGetManyUnassignableGuildMembersByRoleIDAndGuildIDRowToGuildMember(source sqlc.GetManyUnassignableGuildMembersByGuildIDAndRoleIDRow) models.GuildMemberLimited
	ConvertSQLCGetManyUnassignableGuildMembersByRoleIDAndGuildIDRowToGuildMembers(source []sqlc.GetManyUnassignableGuildMembersByGuildIDAndRoleIDRow) []models.GuildMemberLimited

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

	// goverter:ignore Users
	ConvertSQLCChannelToPrivateChannel(source sqlc.Channel) models.PrivateChannel

	// goverter:map AttachmentID Avatar
	ConvertSQLCGetManyUsersByIDsRowToUser(source sqlc.GetManyUsersByIDsRow) models.UserLimited
	ConvertSQLCGetManyUsersByIDsRowToUsers(source []sqlc.GetManyUsersByIDsRow) []models.UserLimited

	ConvertSQLCGetManyUserSessionsByIDRowToUserSession(source sqlc.GetManyUserSessionsByIDRow) models.UserSessionLimited
	ConvertSQLCGetManyUserSessionsByIDRowToUserSessions(source []sqlc.GetManyUserSessionsByIDRow) []models.UserSessionLimited

	// goverter:map AttachmentID Avatar
	ConvertSQLCUpdateUserRowToUpdateUser(source sqlc.UpdateUserRow) models.UpdatedUser

	// goverter:map . User | GetManyUserRelationshipsByUserIDRowToUser
	ConvertSQLCGetManyUserRelationshipsByUserIDRowToUserRelationship(source sqlc.GetManyUserRelationshipsByUserIDRow) models.UserRelationship
	ConvertSQLCGetManyUserRelationshipsByUserIDRowToUserRelationships(source []sqlc.GetManyUserRelationshipsByUserIDRow) []models.UserRelationship

	// goverter:map AttachmentID Avatar
	ConvertSQLCLinkRelationshipUsersRowToUserLimited(source sqlc.LinkManyRelationshipUsersRow) models.UserLimited
	ConvertSQLCLinkRelationshipUsersRowToUsersLimited(source []sqlc.LinkManyRelationshipUsersRow) []models.UserLimited

	// goverter:map AttachmentID Avatar
	ConvertSQLCLinkRelationshipUserRowToUserLimited(source sqlc.LinkRelationshipUserRow) models.UserLimited

	// goverter:ignore User
	ConvertSQLCRelationshipToRelationship(source sqlc.Relationship) models.UserRelationship
}
