package common

import (
	"time"

	"github.com/google/uuid"
)

type ChannelMessageResult struct {
	ID          uuid.UUID
	Content     string
	Pinned      bool
	Flag        int8
	AuthorID    uuid.UUID
	ChannelID   uuid.UUID
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Author      *ChannelMessageAuthorResult
	Attachments []*AttachmentResult
}
