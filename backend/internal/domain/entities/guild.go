package entities

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
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
	CreatedAt       time.Time
	UpdatedAt       time.Time
	IconID          *string
	BannerID        *string
}

func (g *Guild) validate() error {
	if strings.Trim(g.ID, " ") == "" {
		return domain.NewDomainValidationError("empty id")
	}
	if strings.Trim(g.CreatorID, " ") == "" {
		return domain.NewDomainValidationError("empty creator id")
	}
	if strings.Trim(g.Name, " ") == "" {
		return domain.NewDomainValidationError("empty name")
	}
	if g.ChannelCount < 0 {
		return domain.NewDomainValidationError("negative channelCount")
	}
	if g.MemberCount < 1 {
		return domain.NewDomainValidationError("memberCount less than 1")
	}
	if g.IconID != nil && strings.Trim(*g.IconID, " ") == "" {
		return domain.NewDomainValidationError("empty icon id")
	}
	if g.BannerID != nil && strings.Trim(*g.BannerID, " ") == "" {
		return domain.NewDomainValidationError("empty banner id")
	}
	return nil
}

func NewGuild(creatorID string, name string, iconID *string) (*Guild, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	guild := &Guild{
		ID:              ID.String(),
		CreatorID:       creatorID,
		GuildCategoryID: nil,
		Name:            name,
		Description:     "",
		Discoverable:    false,
		ChannelCount:    0,
		MemberCount:     1,
		CreatedAt:       timestamp,
		UpdatedAt:       timestamp,
		IconID:          iconID,
		BannerID:        nil,
	}

	if err := guild.validate(); err != nil {
		return nil, err
	}

	return guild, nil
}

func (g *Guild) IsOwner(userID string) bool {
	return g.CreatorID == userID
}

func (g *Guild) UpdateGuildCategoryID(guildCategoryID *string) error {
	g.UpdatedAt = time.Now().UTC()
	g.GuildCategoryID = guildCategoryID
	return g.validate()
}

func (g *Guild) UpdateName(name string) error {
	g.UpdatedAt = time.Now().UTC()
	g.Name = name
	return g.validate()
}

func (g *Guild) UpdateDescription(description string) error {
	g.UpdatedAt = time.Now().UTC()
	g.Description = description
	return g.validate()
}

func (g *Guild) UpdateDiscoverable(discoverable bool) error {
	g.UpdatedAt = time.Now().UTC()
	g.Discoverable = discoverable
	return g.validate()
}

func (g *Guild) IncrementChannelCount() error {
	g.UpdatedAt = time.Now().UTC()
	g.ChannelCount = g.ChannelCount + 1
	return g.validate()
}

func (g *Guild) IncrementMemberCount() error {
	g.UpdatedAt = time.Now().UTC()
	g.MemberCount = g.MemberCount + 1
	return g.validate()
}

func (g *Guild) DecrementChannelCount() error {
	g.UpdatedAt = time.Now().UTC()
	g.ChannelCount = g.ChannelCount - 1
	return g.validate()
}

func (g *Guild) DecrementMemberCount() error {
	g.UpdatedAt = time.Now().UTC()
	g.MemberCount = g.MemberCount - 1
	return g.validate()
}

func (g *Guild) UpdateIconID(iconID *string) error {
	g.UpdatedAt = time.Now().UTC()
	g.IconID = iconID
	return g.validate()
}

func (g *Guild) UpdateBannerID(bannerID *string) error {
	g.UpdatedAt = time.Now().UTC()
	g.BannerID = bannerID
	return g.validate()
}
