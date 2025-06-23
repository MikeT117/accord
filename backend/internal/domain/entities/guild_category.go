package entities

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type GuildCategory struct {
	ID        string
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *GuildCategory) validate() error {
	if u.ID == "" {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if u.Name == "" {
		return domain.NewDomainValidationError("name must not be empty")
	}
	return nil
}

func NewGuildCategory(name string) (*GuildCategory, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	guildCatgeory := &GuildCategory{
		ID:        ID.String(),
		Name:      name,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
	}

	if err := guildCatgeory.validate(); err != nil {
		return nil, err
	}

	return guildCatgeory, nil
}

func (g *GuildCategory) Updatename(name string) error {
	g.Name = name
	g.UpdatedAt = time.Now().UTC()
	return g.validate()
}
