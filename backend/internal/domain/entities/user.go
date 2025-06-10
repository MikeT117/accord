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
	if u.RelationshipCount < 0 {
		return errors.New("relationshipCount must not be negative")

	}
	return nil
}

func NewUser(username string, email string, avatarID *string, bannerID *string) (*User, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	user := &User{
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
	}

	if err := user.validate(); err != nil {
		return nil, err
	}

	return user, nil
}

func (u *User) Updateusername(username string) error {
	u.Username = username
	u.UpdatedAt = time.Now().UTC().Unix()

	return u.validate()
}
func (u *User) UpdatedisplayName(displayName string) error {
	u.DisplayName = displayName
	u.UpdatedAt = time.Now().UTC().Unix()

	return u.validate()
}
func (u *User) Updateemail(email string) error {
	u.Email = email
	u.UpdatedAt = time.Now().UTC().Unix()

	return u.validate()
}
func (u *User) UpdatepublicFlags(publicFlags int8) error {
	u.PublicFlags = publicFlags
	u.UpdatedAt = time.Now().UTC().Unix()

	return u.validate()
}
func (u *User) IncrementrelationshipCount() error {
	u.RelationshipCount = u.RelationshipCount + 1
	u.UpdatedAt = time.Now().UTC().Unix()

	return u.validate()
}
func (u *User) DecrementrelationshipCount() error {

	u.RelationshipCount = u.RelationshipCount - 1
	u.UpdatedAt = time.Now().UTC().Unix()

	return u.validate()
}
func (u *User) UpdateavatarID(avatarID *string) error {
	u.AvatarID = avatarID
	u.UpdatedAt = time.Now().UTC().Unix()

	return u.validate()
}
func (u *User) UpdatebannerID(bannerID *string) error {
	u.BannerID = bannerID
	u.UpdatedAt = time.Now().UTC().Unix()

	return u.validate()
}
