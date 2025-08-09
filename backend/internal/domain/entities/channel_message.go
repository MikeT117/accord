package entities

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type ChannelMessage struct {
	ID        uuid.UUID
	Content   string
	Pinned    bool
	Flag      int8
	AuthorID  uuid.UUID
	ChannelID uuid.UUID
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *ChannelMessage) validate() error {
	if u.ID == uuid.Nil {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if u.AuthorID == uuid.Nil {
		return domain.NewDomainValidationError("author id must not be empty")
	}
	if u.ChannelID == uuid.Nil {
		return domain.NewDomainValidationError("channel id must not be empty")
	}
	return nil
}

func NewChannelMessage(content string, authorID uuid.UUID, channelID uuid.UUID, attachmentIDs []uuid.UUID) (*ChannelMessage, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	channelMessage := &ChannelMessage{
		ID:        ID,
		Content:   content,
		Pinned:    false,
		Flag:      0,
		AuthorID:  authorID,
		ChannelID: channelID,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
	}

	if err := channelMessage.validate(); err != nil {
		return nil, err
	}

	return channelMessage, nil
}

func (c *ChannelMessage) IsAuthor(authorID uuid.UUID) bool {
	return c.AuthorID == authorID
}

func (c *ChannelMessage) UpdateContent(content string) error {
	c.Content = content
	c.UpdatedAt = time.Now().UTC()
	return c.validate()
}

func (c *ChannelMessage) UpdatePinned(pinned bool) error {
	c.Pinned = pinned
	c.UpdatedAt = time.Now().UTC()
	return c.validate()
}

func (c *ChannelMessage) UpdateFlag(flag int8) error {
	c.Flag = flag
	c.UpdatedAt = time.Now().UTC()
	return c.validate()
}
