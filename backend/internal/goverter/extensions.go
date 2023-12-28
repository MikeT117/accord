package goverter

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// Struct conversion extensions

func CreateUserLimited(ID uuid.UUID, DisplayName string, Username string, PublicFlags int32, Avatar pgtype.UUID) models.UserLimited {
	return models.UserLimited{
		ID:          ID,
		DisplayName: DisplayName,
		Username:    Username,
		PublicFlags: PublicFlags,
		Avatar:      PGTypeUUIDToNullableUUID(Avatar),
	}
}

func ConvertGetManyChannelMessagesByChannelIDRowToAuthor(source sqlc.GetManyChannelMessagesByChannelIDRow) models.UserLimited {
	return CreateUserLimited(source.UserID, source.DisplayName, source.Username, source.PublicFlags, source.AttachmentID)
}

func ConvertCreateChannelMessageRowToAuthor(source sqlc.CreateChannelMessageRow) models.UserLimited {
	return CreateUserLimited(source.UserID, source.DisplayName, source.Username, source.PublicFlags, source.AttachmentID)
}

func GetManyGuildMembersByGuildIDRowToUser(source sqlc.GetManyGuildMembersByGuildIDRow) models.UserLimited {
	return CreateUserLimited(source.ID, source.DisplayName, source.Username, source.PublicFlags, source.AttachmentID)
}

func GetManyAssignableGuildMembersByGuildIDAndRoleIDRowToUser(source sqlc.GetManyAssignableGuildMembersByGuildIDAndRoleIDRow) models.UserLimited {
	return CreateUserLimited(source.ID, source.DisplayName, source.Username, source.PublicFlags, source.AttachmentID)
}

func GetManyUnassignableGuildMembersByGuildIDAndRoleIDRowToUser(source sqlc.GetManyUnassignableGuildMembersByGuildIDAndRoleIDRow) models.UserLimited {
	return CreateUserLimited(source.ID, source.DisplayName, source.Username, source.PublicFlags, source.AttachmentID)
}

func GetManyUserRelationshipsByUserIDRowToUser(source sqlc.GetManyUserRelationshipsByUserIDRow) models.UserLimited {
	return CreateUserLimited(source.UID, source.DisplayName, source.Username, source.PublicFlags, source.AttachmentID)
}

func GetManyGuildBansByGuildIDRowToUser(source sqlc.GetManyGuildBansByGuildIDRow) models.UserLimited {
	return CreateUserLimited(source.UserID, source.DisplayName, source.Username, source.PublicFlags, source.AttachmentID)
}

func ConvertGetManyGuildInvitesByGuildIDRowToGuildInviteToCreator(source sqlc.GetManyGuildInvitesByGuildIDRow) models.UserLimited {
	return CreateUserLimited(source.UserID, source.DisplayName, source.Username, source.PublicFlags, source.AttachmentID)
}

func ConvertSQLCCreateVoiceChannelStateRowToVoiceChannelStateUser(source sqlc.CreateVoiceChannelStateRow) models.UserLimited {
	return CreateUserLimited(source.ID, source.DisplayName, source.Username, source.PublicFlags, source.AttachmentID)
}

// Field conversion extensions

func ConvertInt32ToUint32(b int32) uint32 {
	return uint32(b)
}

func ConvertUUIDToString(b uuid.UUID) string {
	return b.String()
}

func ConvertPGTypeBoolToBool(b pgtype.Bool) bool {
	if b.Valid {
		return b.Bool
	}
	return false
}

func ConvertPGTypeTextToNullableString(b pgtype.Text) *string {
	if b.Valid {
		return &b.String
	}
	return nil
}

func ConvertPGTypeTextToString(b pgtype.Text) string {
	if b.Valid {
		return b.String
	}
	return ""
}

func ConvertPGTypeUUIDToUUID(b pgtype.UUID) uuid.UUID {
	if b.Valid {
		var u = uuid.UUID{}
		copy(u[:], b.Bytes[:])
		return u
	}
	return uuid.UUID{}
}

func ConvertPGTypeUUIDToString(b pgtype.UUID) string {
	return string(b.Bytes[:])
}

func ConvertPGTypeTimestampToNullableTime(b pgtype.Timestamp) *time.Time {
	if b.Valid {
		return &b.Time
	}
	return nil
}

func PGTypeTimestampToTime(b pgtype.Timestamp) time.Time {
	return b.Time
}

func PGTypeUUIDToNullableUUID(b pgtype.UUID) *uuid.UUID {
	if b.Valid {
		var u = uuid.UUID{}
		copy(u[:], b.Bytes[:])
		return &u
	}
	return nil
}
