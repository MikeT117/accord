package entities

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type ChannelMessage struct {
	ID        string
	Content   *string
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

func NewChannelMessage(content *string, authorID string, channelID string, guildID *string, attachmentIDs *[]string) (*ChannelMessage, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	return &ChannelMessage{
		ID:        id.String(),
		Content:   content,
		Pinned:    false,
		Flag:      0,
		AuthorID:  authorID,
		ChannelID: channelID,
		GuildID:   guildID,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
	}, nil
}
