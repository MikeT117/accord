package entities

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                string
	Username          string
	DisplayName       string
	Email             string
	EmailVerified     bool
	PublicFlags       int8
	RelationshipCount int64
	AvatarID          *string
	BannerID          *string
	CreatedAt         int64
	UpdatedAt         int64
}

func (u *User) validate() error {
	if u.ID == "" {
		return errors.New("id must not be empty")
	}
	if u.Username == "" {
		return errors.New("username must not be empty")
	}
	if u.DisplayName == "" {
		return errors.New("displayname must not be empty")
	}
	if u.Email == "" {
		return errors.New("email must not be empty")
	}
	return nil
}

func NewUser(username string, email string, avatarID *string, bannerID *string) (*User, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	return &User{
		ID:                ID.String(),
		Username:          username,
		DisplayName:       username,
		Email:             email,
		EmailVerified:     false,
		PublicFlags:       0,
		RelationshipCount: 0,
		AvatarID:          avatarID,
		BannerID:          bannerID,
		CreatedAt:         timestamp,
		UpdatedAt:         timestamp,
	}, nil
}
