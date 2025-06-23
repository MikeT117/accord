package entities

import (
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const (
	PROVIDER_OAUTH       = "GITHUB"
	PROVIDER_CREDENTIALS = "CREDENTIALS"
)

type Account struct {
	ID                    string
	Provider              string
	ProviderID            *string
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
	if a.ID == "" {
		return domain.NewDomainValidationError("id must not be empty")
	}
	if a.Provider != PROVIDER_CREDENTIALS && a.Provider != PROVIDER_OAUTH {
		return domain.NewDomainValidationError("invalid provider")
	}
	if a.Provider == PROVIDER_CREDENTIALS && (a.Password == nil || *a.Password == "") {
		return domain.NewDomainValidationError("password must not be empty for this provider")
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
	return a.Provider == PROVIDER_OAUTH
}

func NewOAuthAccount(providerID string, accesstoken *string, refreshtoken *string, accesstokenExpiresAt *time.Time, refreshtokenExpiresAt *time.Time, scope *string, IDToken *string) (*Account, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC()

	account := &Account{
		ID:                    id.String(),
		Provider:              PROVIDER_OAUTH,
		ProviderID:            &providerID,
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
		ID:                    id.String(),
		Provider:              PROVIDER_CREDENTIALS,
		ProviderID:            nil,
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
