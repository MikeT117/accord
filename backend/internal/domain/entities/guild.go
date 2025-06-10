package entities

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Guild struct {
	ID              string
	CreatorID       string
	GuildCategoryID *string
	Name            string
	Description     string
	Discoverable    bool
	ChannelCount    int64
	MemberCount     int64
	CreatedAt       int64
	UpdatedAt       int64
	IconID          *string
	BannerID        *string
}

func (g *Guild) validate() error {
	if strings.Trim(g.ID, " ") == "" {
		return errors.New("empty id")
	}
	if strings.Trim(g.CreatorID, " ") == "" {
		return errors.New("empty creator id")
	}
	if strings.Trim(g.Name, " ") == "" {
		return errors.New("empty name")
	}
	if g.ChannelCount >= 0 {
		return errors.New("negative channelCount")
	}
	if g.MemberCount < 1 {
		return errors.New("memberCount less than 1")
	}
	if g.IconID != nil && strings.Trim(*g.IconID, " ") == "" {
		return errors.New("empty icon id")
	}
	if g.BannerID != nil && strings.Trim(*g.BannerID, " ") == "" {
		return errors.New("empty banner id")
	}
	return nil
}

func NewGuild(creatorID string, name string, description string, discoverable bool, iconID *string, bannerID *string) (*Guild, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	guild := &Guild{
		ID:              ID.String(),
		CreatorID:       creatorID,
		GuildCategoryID: nil,
		Name:            name,
		Description:     description,
		Discoverable:    discoverable,
		ChannelCount:    0,
		MemberCount:     1,
		CreatedAt:       timestamp,
		UpdatedAt:       timestamp,
		IconID:          iconID,
		BannerID:        bannerID,
	}

	if err := guild.validate(); err != nil {
		return nil, err
	}

	return guild, nil
}

func (g *Guild) UpdateGuildCategoryID(guildCategoryID *string) error {
	g.UpdatedAt = time.Now().UTC().Unix()
	g.GuildCategoryID = guildCategoryID

	return g.validate()
}

func (g *Guild) UpdateName(name string) error {
	g.UpdatedAt = time.Now().UTC().Unix()
	g.Name = name

	return g.validate()
}

func (g *Guild) UpdateDescription(description string) error {
	g.UpdatedAt = time.Now().UTC().Unix()
	g.Description = description

	return g.validate()
}

func (g *Guild) UpdateDiscoverable(discoverable bool) error {
	g.UpdatedAt = time.Now().UTC().Unix()
	g.Discoverable = discoverable

	return g.validate()
}

func (g *Guild) IncrementChannelCount() error {
	g.UpdatedAt = time.Now().UTC().Unix()
	g.ChannelCount = g.ChannelCount + 1

	return g.validate()
}

func (g *Guild) IncrementMemberCount() error {
	g.UpdatedAt = time.Now().UTC().Unix()
	g.MemberCount = g.MemberCount + 1

	return g.validate()
}

func (g *Guild) DecrementChannelCount() error {
	g.UpdatedAt = time.Now().UTC().Unix()
	g.ChannelCount = g.ChannelCount - 1

	return g.validate()
}

func (g *Guild) DecrementMemberCount() error {
	g.UpdatedAt = time.Now().UTC().Unix()
	g.MemberCount = g.MemberCount - 1

	return g.validate()
}

func (g *Guild) UpdateIconID(iconID *string) error {
	g.UpdatedAt = time.Now().UTC().Unix()
	g.IconID = iconID

	return g.validate()
}

func (g *Guild) UpdateBannerID(bannerID *string) error {
	g.UpdatedAt = time.Now().UTC().Unix()
	g.BannerID = bannerID

	return g.validate()
}
