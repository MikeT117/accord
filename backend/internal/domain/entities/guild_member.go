package entities

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type GuildMember struct {
	UserID    uuid.UUID
	GuildID   uuid.UUID
	Nickname  *string
	CreatedAt time.Time
	UpdatedAt time.Time
	AvatarID  *uuid.UUID
	BannerID  *uuid.UUID
}

func (u *GuildMember) validate() error {
	if u.UserID == uuid.Nil {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if u.GuildID == uuid.Nil {
		return domain.NewDomainValidationError("guild id must not be empty")
	}
	return nil
}

func NewGuildMember(userID uuid.UUID, guildID uuid.UUID, avatarID *uuid.UUID, bannerID *uuid.UUID) (*GuildMember, error) {
	timestamp := time.Now().UTC()

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

func (g *GuildMember) IsOwner(ID uuid.UUID) bool {
	return g.UserID == ID
}

func (g *GuildMember) UpdateNickname(nickname *string) error {
	g.Nickname = nickname
	g.UpdatedAt = time.Now().UTC()
	return g.validate()
}

func (g *GuildMember) UpdateAvatarID(avatarID *uuid.UUID) error {
	g.AvatarID = avatarID
	g.UpdatedAt = time.Now().UTC()
	return g.validate()
}

func (g *GuildMember) UpdateBannerID(bannerID *uuid.UUID) error {
	g.BannerID = bannerID
	g.UpdatedAt = time.Now().UTC()
	return g.validate()
}
