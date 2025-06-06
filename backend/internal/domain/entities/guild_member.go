package entities

import (
	"errors"
	"time"
)

type GuildMember struct {
	UserID    string
	GuildID   string
	Nickname  *string
	CreatedAt int64
	UpdatedAt int64
	AvatarID  *string
	BannerID  *string
}

func (u *GuildMember) validate() error {
	if u.UserID == "" {
		return errors.New("id must not be empty")
	}
	if u.GuildID == "" {
		return errors.New("guild id must not be empty")
	}
	return nil
}

func NewGuildMember(userID string, guildID string, avatarID *string, bannerID *string) (*GuildMember, error) {
	timestamp := time.Now().UTC().Unix()

	return &GuildMember{
		UserID:    userID,
		GuildID:   guildID,
		Nickname:  nil,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
		AvatarID:  avatarID,
		BannerID:  bannerID,
	}, nil
}

func UpdateGuildMember(userID string, guildID string, avatarID *string, bannerID *string, createdAt int64) (*GuildMember, error) {
	timestamp := time.Now().UTC().Unix()

	return &GuildMember{
		UserID:    userID,
		GuildID:   guildID,
		Nickname:  nil,
		AvatarID:  avatarID,
		BannerID:  bannerID,
		CreatedAt: createdAt,
		UpdatedAt: timestamp,
	}, nil
}
