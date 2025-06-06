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

	return &GuildCategory{
		ID:        ID.String(),
		Name:      name,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
	}, nil
}
