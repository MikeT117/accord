package entities

import (
	"strings"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

const (
	OwnerRootRoleName        = "@owner"
	OwnerRootRolePermissions = 2147483647

	DefaultRootRoleName        = "@default"
	DefaultRootRolePermissions = 1

	NewRoleName        = "New-Role"
	NewRolePermissions = 0
)

type GuildRole struct {
	ID          uuid.UUID
	GuildID     uuid.UUID
	Name        string
	Permissions int32
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (a *GuildRole) validate() error {
	if a.ID == uuid.Nil {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if a.GuildID == uuid.Nil {
		return domain.NewDomainValidationError("guild id id must not be empty")
	}
	if strings.Trim(a.Name, " ") == "" {
		return domain.NewDomainValidationError("name must not be empty")
	}
	return nil
}

func NewGuildRole(guildID uuid.UUID) (*GuildRole, error) {
	ID, err := uuid.NewV7()

	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	guildRole := &GuildRole{
		ID:          ID,
		GuildID:     guildID,
		Name:        NewRoleName,
		Permissions: NewRolePermissions,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}

	if err := guildRole.validate(); err != nil {
		return nil, err
	}

	return guildRole, nil
}

func NewOwnerGuildRole(guildID uuid.UUID) (*GuildRole, error) {
	ID, err := uuid.NewV7()

	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	return &GuildRole{
		ID:          ID,
		GuildID:     guildID,
		Name:        OwnerRootRoleName,
		Permissions: OwnerRootRolePermissions,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}, nil
}

func NewDefaultGuildRole(guildID uuid.UUID) (*GuildRole, error) {
	ID, err := uuid.NewV7()

	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	return &GuildRole{
		ID:          ID,
		GuildID:     guildID,
		Name:        DefaultRootRoleName,
		Permissions: DefaultRootRolePermissions,
		CreatedAt:   timestamp,
		UpdatedAt:   timestamp,
	}, nil
}

func (g *GuildRole) IsRootOwnerRole() bool {
	return g.Name == OwnerRootRoleName
}

func (g *GuildRole) IsRootDefaultRole() bool {
	return g.Name == DefaultRootRoleName
}

func (g *GuildRole) UpdatedPermissions(permissions int32) error {
	if g.IsRootOwnerRole() {
		return domain.NewDomainValidationError("invalid role permissions")
	}

	g.Permissions = permissions
	g.UpdatedAt = time.Now().UTC()
	return g.validate()
}

func (g *GuildRole) UpdateName(name string) error {
	if (g.IsRootOwnerRole() && name != OwnerRootRoleName) || (g.IsRootDefaultRole() && name != DefaultRootRoleName) {
		return domain.NewDomainValidationError("invalid role name")
	}

	g.Name = name
	g.UpdatedAt = time.Now().UTC()
	return g.validate()
}
