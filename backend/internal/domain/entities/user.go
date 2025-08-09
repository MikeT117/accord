package entities

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type User struct {
	ID                uuid.UUID
	AccountID         uuid.UUID
	Username          string
	DisplayName       string
	Email             string
	EmailVerified     bool
	PublicFlags       int8
	RelationshipCount int64
	AvatarID          *uuid.UUID
	BannerID          *uuid.UUID
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

func (u *User) validate() error {
	if u.ID == uuid.Nil {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if u.AccountID == uuid.Nil {
		return domain.NewDomainValidationError("account id must not be empty")
	}
	if u.Username == "" {
		return domain.NewDomainValidationError("username must not be empty")
	}
	if u.DisplayName == "" {
		return domain.NewDomainValidationError("displayname must not be empty")
	}
	if u.Email == "" {
		return domain.NewDomainValidationError("email must not be empty")
	}
	if u.RelationshipCount < 0 {
		return domain.NewDomainValidationError("relationshipCount must not be negative")

	}
	return nil
}

func NewUser(username string, accountID uuid.UUID, email string, avatarID *uuid.UUID, bannerID *uuid.UUID) (*User, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	user := &User{
		ID:                ID,
		AccountID:         accountID,
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

func (u *User) UpdateUsername(username string) error {
	u.Username = username
	u.UpdatedAt = time.Now().UTC()
	return u.validate()
}

func (u *User) UpdateDisplayName(displayName string) error {
	u.DisplayName = displayName
	u.UpdatedAt = time.Now().UTC()
	return u.validate()
}

func (u *User) UpdateEmail(email string) error {
	u.Email = email
	u.UpdatedAt = time.Now().UTC()
	return u.validate()
}

func (u *User) UpdatePublicFlags(publicFlags int8) error {
	u.PublicFlags = publicFlags
	u.UpdatedAt = time.Now().UTC()
	return u.validate()
}

func (u *User) IncrementRelationshipCount() error {
	u.RelationshipCount = u.RelationshipCount + 1
	u.UpdatedAt = time.Now().UTC()
	return u.validate()
}

func (u *User) DecrementRelationshipCount() error {
	u.RelationshipCount = u.RelationshipCount - 1
	u.UpdatedAt = time.Now().UTC()
	return u.validate()
}

func (u *User) UpdateAvatarID(avatarID *uuid.UUID) error {
	u.AvatarID = avatarID
	u.UpdatedAt = time.Now().UTC()
	return u.validate()
}

func (u *User) UpdateBannerID(bannerID *uuid.UUID) error {
	u.BannerID = bannerID
	u.UpdatedAt = time.Now().UTC()
	return u.validate()
}
