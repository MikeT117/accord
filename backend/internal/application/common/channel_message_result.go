package common

import "time"

type ChannelMessageResult struct {
	ID          string
	Content     string
	Pinned      bool
	Flag        int8
	AuthorID    string
	ChannelID   string
	GuildID     *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Author      *ChannelMessageAuthorResult
	Attachments []*AttachmentResult
}
