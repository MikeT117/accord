package entities

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type User struct {
	ID                string
	AccountID         string
	Username          string
	DisplayName       string
	Email             string
	EmailVerified     bool
	PublicFlags       int8
	RelationshipCount int64
	AvatarID          *string
	BannerID          *string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

func (u *User) validate() error {
	if u.ID == "" {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if u.AccountID == "" {
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

func NewUser(username string, accountID string, email string, avatarID *string, bannerID *string) (*User, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	user := &User{
		ID:                ID.String(),
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

func (u *User) UpdateAvatarID(avatarID *string) error {
	u.AvatarID = avatarID
	u.UpdatedAt = time.Now().UTC()
	return u.validate()
}

func (u *User) UpdateBannerID(bannerID *string) error {
	u.BannerID = bannerID
	u.UpdatedAt = time.Now().UTC()
	return u.validate()
}
