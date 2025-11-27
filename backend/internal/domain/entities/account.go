package entities

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Account struct {
	ID                    uuid.UUID
	Provider              string
	ProviderID            string
	Accesstoken           *string
	Refreshtoken          *string
	AccesstokenExpiresAt  *time.Time
	RefreshtokenExpiresAt *time.Time
	Scope                 *string
	IDToken               *string
	Password              *string
	CreatedAt             time.Time
	UpdatedAt             time.Time
}

func (a *Account) validate() error {
	if a.ID == uuid.Nil {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if a.Provider != constants.PROVIDER_CREDENTIALS && a.Provider != constants.PROVIDER_OAUTH_GITHUB && a.Provider != constants.PROVIDER_OAUTH_GITLAB {
		return domain.NewDomainValidationError("invalid provider")
	}
	if a.Provider == constants.PROVIDER_CREDENTIALS && (a.Password == nil || *a.Password == "") {
		return domain.NewDomainValidationError("password must not be empty for this provider")
	}
	if a.ProviderID == "" {
		return domain.NewDomainValidationError("invalid provider id")
	}

	return nil
}

func (a *Account) ValidatePassword(plaintextPassword string) error {
	if err := bcrypt.CompareHashAndPassword([]byte(*a.Password), []byte(plaintextPassword)); err != nil {
		return domain.ErrInvalidCredentials
	}

	return nil
}

func (a *Account) hashPassword() error {
	hash, err := bcrypt.GenerateFromPassword([]byte(*a.Password), 10)

	if err != nil {
		return err
	}

	stringHash := string(hash)
	a.Password = &stringHash

	return nil
}

func (a *Account) IsOAuthProvider() bool {
	return a.Provider == constants.PROVIDER_OAUTH_GITHUB || a.Provider == constants.PROVIDER_OAUTH_GITLAB
}

func NewOAuthAccount(provider string, providerID string, accesstoken *string, refreshtoken *string, accesstokenExpiresAt *time.Time, refreshtokenExpiresAt *time.Time, scope *string, IDToken *string) (*Account, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()

	account := &Account{
		ID:                    id,
		Provider:              provider,
		ProviderID:            providerID,
		Accesstoken:           accesstoken,
		Refreshtoken:          refreshtoken,
		AccesstokenExpiresAt:  accesstokenExpiresAt,
		RefreshtokenExpiresAt: refreshtokenExpiresAt,
		Scope:                 scope,
		IDToken:               IDToken,
		CreatedAt:             timestamp,
		UpdatedAt:             timestamp,
		Password:              nil,
	}

	if err := account.validate(); err != nil {
		return nil, err
	}

	return account, nil
}

func NewCredentialsAccount(password *string) (*Account, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()

	account := &Account{
		ID:                    id,
		Provider:              constants.PROVIDER_CREDENTIALS,
		ProviderID:            id.String(),
		Accesstoken:           nil,
		Refreshtoken:          nil,
		AccesstokenExpiresAt:  nil,
		RefreshtokenExpiresAt: nil,
		Scope:                 nil,
		IDToken:               nil,
		CreatedAt:             timestamp,
		UpdatedAt:             timestamp,
		Password:              password,
	}

	if err := account.hashPassword(); err != nil {
		return nil, err
	}

	if err := account.validate(); err != nil {
		return nil, err
	}

	return account, nil
}
