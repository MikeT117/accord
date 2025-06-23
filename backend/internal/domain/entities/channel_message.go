package entities

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type ChannelMessage struct {
	ID        string
	Content   string
	Pinned    bool
	Flag      int8
	AuthorID  string
	ChannelID string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *ChannelMessage) validate() error {
	if strings.Trim(u.ID, " ") == "" {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if strings.Trim(u.AuthorID, " ") == "" {
		return domain.NewDomainValidationError("author id must not be empty")
	}
	if strings.Trim(u.ChannelID, " ") == "" {
		return domain.NewDomainValidationError("channel id must not be empty")
	}
	return nil
}

func NewChannelMessage(content string, authorID string, channelID string, attachmentIDs []string) (*ChannelMessage, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	channelMessage := &ChannelMessage{
		ID:        ID.String(),
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

func (c *ChannelMessage) IsAuthor(authorID string) bool {
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
