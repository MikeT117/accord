package entities

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	GuildChannel int8 = iota
	GuildVoiceChannel
	GuildCategoryChannel
	DMChannel
	GroupDMChannel
)

type Channel struct {
	ID          string
	CreatorID   *string
	GuildID     *string
	ParentID    *string
	Name        *string
	Topic       *string
	ChannelType int8
	CreatedAt   int64
	UpdatedAt   int64
}

func (u *Channel) validate() error {
	if strings.Trim(u.ID, " ") == "" {
		return errors.New("id must not be empty")
	}

	if u.ChannelType != GuildChannel && u.ChannelType != GuildVoiceChannel && u.ChannelType != DMChannel && u.ChannelType != GroupDMChannel && u.ChannelType != GuildCategoryChannel {
		return errors.New("invalid channel type")
	}

	if u.ChannelType == GuildChannel || u.ChannelType == GuildVoiceChannel || u.ChannelType == GuildCategoryChannel {
		if u.GuildID == nil || strings.Trim(*u.GuildID, " ") == "" {
			return errors.New("guild id must not be empty")
		}
		if u.CreatorID == nil || strings.Trim(*u.CreatorID, " ") == "" {
			return errors.New("creator id must not be empty")
		}
		if u.Name == nil || strings.Trim(*u.Name, " ") == "" {
			return errors.New("name id must not be empty")
		}

	} else {
		if u.GuildID != nil {
			return errors.New("guild id must not be populated for direct channels")
		}
		if u.CreatorID != nil {
			return errors.New("creator id must not be populated for direct channels")
		}
		if u.Name != nil {
			return errors.New("name must not be populated for direct channels")
		}
	}

	return nil
}

func (u *Channel) IsGuildChannel() bool {
	return u.ChannelType < DMChannel
}

func NewChannel(channelType int8, guildID string, creatorID string, name string, topic *string) (*Channel, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	return &Channel{
		ID:          id.String(),
		CreatorID:   &creatorID,
		GuildID:     &guildID,
		ParentID:    nil,
		Name:        &name,
		Topic:       nil,
		ChannelType: channelType,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}, nil
}

func UpdateGuildChannel(
	ID string,
	creatorID *string,
	guildID *string,
	parentID *string,
	name *string,
	topic *string,
	channelType int8,
	createdAt int64,
) (*Channel, error) {
	timestamp := time.Now().UTC().Unix()

	return &Channel{
		ID:          ID,
		CreatorID:   creatorID,
		GuildID:     guildID,
		ParentID:    parentID,
		Name:        name,
		Topic:       topic,
		ChannelType: channelType,
		CreatedAt:   createdAt,
		UpdatedAt:   timestamp,
	}, nil
}
