package entities

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
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
	ID          uuid.UUID
	CreatorID   uuid.UUID
	GuildID     *uuid.UUID
	ParentID    *uuid.UUID
	Name        *string
	Topic       *string
	ChannelType int8
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (u *Channel) validate() error {
	if u.ID == uuid.Nil {
		return domain.NewDomainValidationError("id must not be empty")
	}

	if u.ChannelType != GuildChannel && u.ChannelType != GuildVoiceChannel && u.ChannelType != DMChannel && u.ChannelType != GroupDMChannel && u.ChannelType != GuildCategoryChannel {
		return domain.NewDomainValidationError("invalid channel type")
	}

	if u.CreatorID == uuid.Nil {
		return domain.NewDomainValidationError("creator id must not be empty")
	}

	if u.ChannelType == GuildChannel || u.ChannelType == GuildVoiceChannel || u.ChannelType == GuildCategoryChannel {
		if u.GuildID == nil || *u.GuildID == uuid.Nil {
			return domain.NewDomainValidationError("guild id must not be empty")
		}
		if u.Name == nil || strings.Trim(*u.Name, " ") == "" {
			return domain.NewDomainValidationError("name id must not be empty")
		}
	} else {
		if u.GuildID != nil {
			return domain.NewDomainValidationError("guild id must not be populated for direct channels")
		}
		if u.Name != nil {
			return domain.NewDomainValidationError("name must not be populated for direct channels")
		}
	}

	return nil
}

func NewChannel(channelType int8, guildID *uuid.UUID, creatorID uuid.UUID, name *string) (*Channel, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	channel := &Channel{
		ID:          id,
		CreatorID:   creatorID,
		GuildID:     guildID,
		ParentID:    nil,
		Name:        name,
		Topic:       nil,
		ChannelType: channelType,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}

	if channel.ChannelType != GuildCategoryChannel {
		channel.Topic = new("")
	}

	if err := channel.validate(); err != nil {
		return nil, err
	}

	return channel, nil
}

func (u *Channel) IsGuildChannel() bool {
	return u.GuildID != nil
}

func (u *Channel) IsGuildCategoryChannel() bool {
	return u.ChannelType == GuildCategoryChannel
}

func (c *Channel) UpdateParentID(parentID *uuid.UUID) error {
	c.ParentID = parentID
	c.UpdatedAt = time.Now().UTC()
	return c.validate()
}

func (c *Channel) UpdateName(name string) error {
	c.Name = &name
	c.UpdatedAt = time.Now().UTC()
	return c.validate()
}

func (c *Channel) UpdateTopic(topic *string) error {
	c.Topic = topic
	c.UpdatedAt = time.Now().UTC()
	return c.validate()
}
