package entities

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	GUILD_OWNER = iota
	GUILD_ADMIN
	MANAGE_GUILD
	MANAGE_GUILD_CHANNELS
	MANAGE_CHANNEL_MESSAGES
	VIEW_GUILD_CHANNEL
	CREATE_CHANNEL_MESSAGE
	CREATE_CHANNEL_PIN
	VIEW_GUILD_MEMBERS
)

type GuildRole struct {
	ID          string
	GuildID     string
	Name        string
	Permissions int32
	CreatedAt   int64
	UpdatedAt   int64
}

func (a *GuildRole) validate() error {
	if strings.Trim(a.ID, " ") == "" {
		return errors.New("id must not be empty")
	}
	if strings.Trim(a.GuildID, " ") == "" {
		return errors.New("guild id id must not be empty")
	}
	if strings.Trim(a.Name, " ") == "" {
		return errors.New("name must not be empty")
	}
	return nil
}

func NewGuildRole(guildID string, name string) (*GuildRole, error) {
	ID, err := uuid.NewV7()

	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	guildRole := &GuildRole{
		ID:          ID.String(),
		GuildID:     guildID,
		Name:        name,
		Permissions: 0,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}

	if err := guildRole.validate(); err != nil {
		return nil, err
	}

	return guildRole, nil
}

func NewOwnerGuildRole(guildID string) (*GuildRole, error) {
	ID, err := uuid.NewV7()

	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	return &GuildRole{
		ID:          ID.String(),
		GuildID:     guildID,
		Name:        "@Owner",
		Permissions: 2147483647,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}, nil
}

func NewDefaultGuildRole(guildID string) (*GuildRole, error) {
	ID, err := uuid.NewV7()

	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	return &GuildRole{
		ID:          ID.String(),
		GuildID:     guildID,
		Name:        "@default",
		Permissions: 1,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}, nil
}

func (g *GuildRole) UpdatedPermissions(permissions int32) error {
	g.Permissions = permissions
	g.UpdatedAt = time.Now().UTC().Unix()

	return g.validate()
}

func (g *GuildRole) UpdateName(name string) error {
	g.Name = name
	g.UpdatedAt = time.Now().UTC().Unix()

	return g.validate()
}
