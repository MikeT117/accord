package repositories

import (
	"context"
)

type ChannelMessageAttachmentRepository interface {
	Create(context context.Context, channelMessageID string, attachmentID string) error
	Delete(context context.Context, channelMessageID string, attachmentID string) error
}
