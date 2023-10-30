package rest_api

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type GuildCreateRequestBody struct {
	Name           string     `json:"name"`
	IsDiscoverable bool       `json:"isDiscoverable"`
	Icon           *uuid.UUID `json:"icon"`
}

type GuildUpdateRequestBody struct {
	Name           string      `json:"name"`
	Description    string      `json:"description"`
	IsDiscoverable bool        `json:"isDiscoverable"`
	Icon           *uuid.UUID  `json:"icon"`
	Banner         *uuid.UUID  `json:"banner"`
	CategoryID     pgtype.UUID `json:"categoryId"`
}

type GuildRoleUpdateRequestBody struct {
	Name        string `json:"name"`
	Permissions int32  `json:"permissions"`
}

type GuildRoleMemberCreateBody struct {
	UserIDs []uuid.UUID `json:"userIDs"`
}

type GuildRoleChannelCreateBody struct {
	ChannelIDs []uuid.UUID `json:"channelIds"`
}

type GuildMemberUpdateBody struct {
	Nickname pgtype.Text `json:"nickname"`
}

type GuildChannelCreateBody struct {
	Name        string      `json:"name"`
	Topic       string      `json:"topic"`
	IsPrivate   bool        `json:"isPrivate"`
	Roles       []uuid.UUID `json:"roles"`
	ChannelType int16       `json:"channelType"`
}

type GroupChannelCreateBody struct {
	Recipients []uuid.UUID `json:"recipients"`
}

type BannedGuildMemberCreateBody struct {
	Reason string `json:"reason"`
}

type ChannelUpdateBody struct {
	Name  string      `json:"name"`
	Topic pgtype.Text `json:"topic"`
}

type AttachmentSignBody struct {
	Filename     string `json:"filename"`
	Filesize     int64  `json:"filesize"`
	Height       int64  `json:"height"`
	Width        int64  `json:"width"`
	ResourceType string `json:"resourceType"`
}

type ChannelMessageCreateBody struct {
	Content     string      `json:"content"`
	Attachments []uuid.UUID `json:"attachments"`
}

type ChannelMessageUpdateBody struct {
	Content string `json:"content"`
}
