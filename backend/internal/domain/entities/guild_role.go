package entities

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type GuildRole struct {
	ID          string
	GuildID     string
	Name        string
	Permissions int32
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (a *GuildRole) validate() error {
	if strings.Trim(a.ID, " ") == "" {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if strings.Trim(a.GuildID, " ") == "" {
		return domain.NewDomainValidationError("guild id id must not be empty")
	}
	if strings.Trim(a.Name, " ") == "" {
		return domain.NewDomainValidationError("name must not be empty")
	}
	return nil
}

func NewGuildRole(guildID string, name string) (*GuildRole, error) {
	ID, err := uuid.NewV7()

	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
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

	timestamp := time.Now().UTC()
	return &GuildRole{
		ID:          ID.String(),
		GuildID:     guildID,
		Name:        "@owner",
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

	timestamp := time.Now().UTC()
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
	g.UpdatedAt = time.Now().UTC()
	return g.validate()
}

func (g *GuildRole) UpdateName(name string) error {
	g.Name = name
	g.UpdatedAt = time.Now().UTC()
	return g.validate()
}
