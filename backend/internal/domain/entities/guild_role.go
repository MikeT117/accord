package entities

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
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
	id, err := uuid.NewV7()

	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	return &GuildRole{
		ID:          id.String(),
		GuildID:     guildID,
		Name:        name,
		Permissions: 0,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}, nil
}

func NewOwnerGuildRole(guildID string) (*GuildRole, error) {
	id, err := uuid.NewV7()

	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	return &GuildRole{
		ID:          id.String(),
		GuildID:     guildID,
		Name:        "@Owner",
		Permissions: 2147483647,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}, nil
}

func NewDefaultGuildRole(guildID string) (*GuildRole, error) {
	id, err := uuid.NewV7()

	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	return &GuildRole{
		ID:          id.String(),
		GuildID:     guildID,
		Name:        "@default",
		Permissions: 1,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}, nil
}

func UpdatedGuildRole(ID string, name string, guildID string, permissions int32, createdAt int64) *GuildRole {

	timestamp := time.Now().UTC().Unix()

	return &GuildRole{
		ID:          ID,
		GuildID:     guildID,
		Name:        name,
		Permissions: permissions,
		CreatedAt:   createdAt,
		UpdatedAt:   timestamp,
	}
}
