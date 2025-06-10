package entities

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Account struct {
	ID                    string
	UserID                string
	AccountID             string
	ProviderID            string
	Accesstoken           *string
	Refreshtoken          *string
	AccesstokenExpiresAt  *int64
	RefreshtokenExpiresAt *int64
	Scope                 *string
	IDToken               *string
	Password              *string
	CreatedAt             int64
	UpdatedAt             int64
}

func (a *Account) validate() error {
	if a.ID == "" {
		return errors.New("id must not be empty")
	}
	if a.UserID == "" {
		return errors.New("title must not be empty")
	}
	if a.AccountID == "" {
		return errors.New("asset id must not be empty")
	}
	if a.ProviderID == "" {
		return errors.New("invalid provider")
	}
	if a.Password == nil || *a.Password == "" {
		return errors.New("password must not be empty")
	}

	return nil
}

func (a *Account) ValidatePassword(plaintextPassword string) error {
	if err := bcrypt.CompareHashAndPassword([]byte(*a.Password), []byte(plaintextPassword)); err != nil {
		return errors.New("invalid credentials")
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

func NewAccount(
	userID string,
	accountID string,
	providerID string,
	accesstoken *string,
	refreshtoken *string,
	accesstokenExpiresAt *int64,
	refreshtokenExpiresAt *int64,
	scope *string,
	idToken *string,
	password *string,
) (*Account, error) {
	id, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	timestamp := time.Now().UTC().Unix()

	account := &Account{
		ID:                    id.String(),
		UserID:                userID,
		ProviderID:            providerID,
		Accesstoken:           accesstoken,
		Refreshtoken:          refreshtoken,
		AccesstokenExpiresAt:  accesstokenExpiresAt,
		RefreshtokenExpiresAt: refreshtokenExpiresAt,
		Scope:                 scope,
		IDToken:               idToken,
		CreatedAt:             timestamp,
		UpdatedAt:             timestamp,
		AccountID:             userID,
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
