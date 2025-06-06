package entities

import (
	"errors"
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

func (a *Guild) validate() error {
	if a.ID == "" {
		return errors.New("id must not be empty")
	}
	if a.CreatorID == "" {
		return errors.New("creator id must not be empty")
	}
	if a.Name == "" {
		return errors.New("name must not be empty")
	}
	return nil
}

func NewGuild(creatorID string, name string, discoverable bool, iconID *string, bannerID *string) (*Guild, error) {
	id, err := uuid.NewV7()

	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	return &Guild{
		ID:              id.String(),
		CreatorID:       creatorID,
		GuildCategoryID: nil,
		Name:            name,
		Description:     "",
		Discoverable:    discoverable,
		ChannelCount:    0,
		MemberCount:     1,
		CreatedAt:       timestamp,
		UpdatedAt:       timestamp,
		IconID:          iconID,
		BannerID:        bannerID,
	}, nil
}

func UpdateGuild(ID string, creatorID string, guildCategoryID *string, name string, description string, discoverable bool, channelCount int64, memberCount int64, createdAt int64, iconID *string, bannerID *string) (*Guild, error) {
	timestamp := time.Now().UTC().Unix()

	return &Guild{
		ID:              ID,
		CreatorID:       creatorID,
		GuildCategoryID: guildCategoryID,
		Name:            name,
		Description:     description,
		Discoverable:    discoverable,
		ChannelCount:    channelCount,
		MemberCount:     memberCount,
		CreatedAt:       createdAt,
		UpdatedAt:       timestamp,
		IconID:          iconID,
		BannerID:        bannerID,
	}, nil

}
