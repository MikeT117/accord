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

	guildMember := &GuildMember{
		UserID:    userID,
		GuildID:   guildID,
		Nickname:  nil,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
		AvatarID:  avatarID,
		BannerID:  bannerID,
	}

	if err := guildMember.validate(); err != nil {
		return nil, err
	}

	return guildMember, nil
}

func (g *GuildMember) UpdateNickname(nickname *string) error {
	g.Nickname = nickname
	g.UpdatedAt = time.Now().UTC().Unix()

	return g.validate()
}

func (g *GuildMember) UpdateAvatarID(avatarID *string) error {
	g.AvatarID = avatarID
	g.UpdatedAt = time.Now().UTC().Unix()

	return g.validate()
}

func (g *GuildMember) UpdateBannerID(bannerID *string) error {
	g.BannerID = bannerID
	g.UpdatedAt = time.Now().UTC().Unix()

	return g.validate()
}
