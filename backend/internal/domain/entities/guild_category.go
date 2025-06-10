package entities

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type GuildCategory struct {
	ID        string
	Name      string
	CreatedAt int64
	UpdatedAt int64
}

func (u *GuildCategory) validate() error {
	if u.ID == "" {
		return errors.New("id must not be empty")
	}
	if u.Name == "" {
		return errors.New("name must not be empty")
	}
	return nil
}

func NewGuildCategory(name string) (*GuildCategory, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

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
	g.UpdatedAt = time.Now().UTC().Unix()

	return g.validate()
}
