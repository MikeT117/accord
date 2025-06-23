package entities

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
)

type Session struct {
	ID        string
	UserID    string
	Token     string
	ExpiresAt time.Time
	IPAddress string
	UserAgent string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *Session) validate() error {
	if u.ID == "" {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if u.UserID == "" {
		return domain.NewDomainValidationError("user id must not be empty")
	}
	if u.Token == "" {
		return domain.NewDomainValidationError("token must not be empty")
	}
	return nil
}

func NewSession(userID string, token string, expiresAt time.Time, ipAddress string, userAgent string) (*Session, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()
	session := &Session{
		ID:        ID.String(),
		UserID:    userID,
		Token:     token,
		IPAddress: ipAddress,
		UserAgent: userAgent,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
		ExpiresAt: expiresAt,
	}

	if err := session.validate(); err != nil {
		return nil, err
	}

	return session, nil
}
