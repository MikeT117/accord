package entities

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type ChannelMessage struct {
	ID        string
	Content   string
	Pinned    bool
	Flag      int8
	AuthorID  string
	ChannelID string
	GuildID   *string
	CreatedAt int64
	UpdatedAt int64
}

func (u *ChannelMessage) validate() error {
	if strings.Trim(u.ID, " ") == "" {
		return errors.New("id must not be empty")
	}
	if strings.Trim(u.AuthorID, " ") == "" {
		return errors.New("author id must not be empty")
	}
	if strings.Trim(u.ChannelID, " ") == "" {
		return errors.New("channel id must not be empty")
	}
	if u.GuildID != nil && strings.Trim(*u.GuildID, " ") == "" {
		return errors.New("guild id must not be empty")
	}
	return nil
}

func NewChannelMessage(content string, authorID string, channelID string, guildID *string, attachmentIDs []string) (*ChannelMessage, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	channelMessage := &ChannelMessage{
		ID:        ID.String(),
		Content:   content,
		Pinned:    false,
		Flag:      0,
		AuthorID:  authorID,
		ChannelID: channelID,
		GuildID:   guildID,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
	}

	if err := channelMessage.validate(); err != nil {
		return nil, err
	}

	return channelMessage, nil
}

func (c *ChannelMessage) WithinGuild() bool {
	return c.GuildID != nil
}

func (c *ChannelMessage) UpdateContent(content string) error {
	c.Content = content
	c.UpdatedAt = time.Now().UTC().Unix()

	return c.validate()
}

func (c *ChannelMessage) UpdatePinned(pinned bool) error {
	c.Pinned = pinned
	c.UpdatedAt = time.Now().UTC().Unix()

	return c.validate()
}

func (c *ChannelMessage) UpdateFlag(flag int8) error {
	c.Flag = flag
	c.UpdatedAt = time.Now().UTC().Unix()

	return c.validate()
}
