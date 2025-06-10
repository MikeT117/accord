package entities

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID        string
	UserID    string
	Token     string
	ExpiresAt int64
	IPAddress string
	UserAgent string
	CreatedAt int64
	UpdatedAt int64
}

func (u *Session) validate() error {
	if u.ID == "" {
		return errors.New("id must not be empty")
	}
	if u.UserID == "" {
		return errors.New("user id must not be empty")
	}
	if u.Token == "" {
		return errors.New("token must not be empty")
	}
	return nil
}

func NewSession(userID string, token string, expiresAt int64, ipAddress string, userAgent string) (*Session, error) {
	ID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

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
