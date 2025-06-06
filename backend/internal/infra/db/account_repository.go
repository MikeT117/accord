package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type AccountRepository struct {
	db DBTX
}

func CreateAccountRepository(db DBTX) repositories.AccountRepository {
	return &AccountRepository{db: db}
}

func (r *AccountRepository) GetByID(context context.Context, ID string) (*entities.Account, error) {
	row := r.db.QueryRow(context, `
		SELECT
			id,
			user_id,
			account_id,
			provider_id,
			access_token,
			refresh_token,
			access_token_expires_at,
			refresh_token_expires_at,
			scope,
			id_token,
			password,
			created_at,
			updated_at
		FROM
			account
		WHERE
			id = $1;
	`, ID)

	account := &entities.Account{}
	if err := row.Scan(
		&account.ID,
		&account.UserID,
		&account.AccountID,
		&account.ProviderID,
		&account.Accesstoken,
		&account.Refreshtoken,
		&account.AccesstokenExpiresAt,
		&account.RefreshtokenExpiresAt,
		&account.Scope,
		&account.IDToken,
		&account.Password,
		&account.CreatedAt,
		&account.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return account, nil
}
func (r *AccountRepository) GetByUserID(context context.Context, userID string) (*entities.Account, error) {
	row := r.db.QueryRow(context, `
	SELECT
		id,
		user_id,
		account_id,
		provider_id,
		access_token,
		refresh_token,
		access_token_expires_at,
		refresh_token_expires_at,
		scope,
		id_token,
		password,
		created_at,
		updated_at
	FROM
		account
	WHERE
		user_id = $1;
`, userID)

	account := &entities.Account{}
	if err := row.Scan(
		&account.ID,
		&account.UserID,
		&account.AccountID,
		&account.ProviderID,
		&account.Accesstoken,
		&account.Refreshtoken,
		&account.AccesstokenExpiresAt,
		&account.RefreshtokenExpiresAt,
		&account.Scope,
		&account.IDToken,
		&account.Password,
		&account.CreatedAt,
		&account.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return account, nil
}
func (r *AccountRepository) GetByAccountID(context context.Context, ID string) (*entities.Account, error) {
	row := r.db.QueryRow(context, `
	SELECT
		id,
		user_id,
		account_id,
		provider_id,
		access_token,
		refresh_token,
		access_token_expires_at,
		refresh_token_expires_at,
		scope,
		id_token,
		password,
		created_at,
		updated_at
	FROM
		account
	WHERE
		account_id = $1;
`, ID)

	account := &entities.Account{}
	if err := row.Scan(
		&account.ID,
		&account.UserID,
		&account.AccountID,
		&account.ProviderID,
		&account.Accesstoken,
		&account.Refreshtoken,
		&account.AccesstokenExpiresAt,
		&account.RefreshtokenExpiresAt,
		&account.Scope,
		&account.IDToken,
		&account.Password,
		&account.CreatedAt,
		&account.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return account, nil
}
func (r *AccountRepository) GetByProviderID(context context.Context, ID string) (*entities.Account, error) {
	row := r.db.QueryRow(context, `
	SELECT
		id,
		user_id,
		account_id,
		provider_id,
		access_token,
		refresh_token,
		access_token_expires_at,
		refresh_token_expires_at,
		scope,
		id_token,
		password,
		created_at,
		updated_at
	FROM
		account
	WHERE
		provider_id = $1;
`, ID)

	account := &entities.Account{}
	if err := row.Scan(
		&account.ID,
		&account.UserID,
		&account.AccountID,
		&account.ProviderID,
		&account.Accesstoken,
		&account.Refreshtoken,
		&account.AccesstokenExpiresAt,
		&account.RefreshtokenExpiresAt,
		&account.Scope,
		&account.IDToken,
		&account.Password,
		&account.CreatedAt,
		&account.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return account, nil
}
func (r *AccountRepository) Create(context context.Context, validatedAccount *entities.ValidatedAccount) (*entities.Account, error) {
	row := r.db.QueryRow(context, `
		INSERT INTO
			account (
				id,
				user_id,
				account_id,
				provider_id,
				access_token,
				refresh_token,
				access_token_expires_at,
				refresh_token_expires_at,
				scope,
				id_token,
				password,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING
			id,
			user_id,
			account_id,
			provider_id,
			access_token,
			refresh_token,
			access_token_expires_at,
			refresh_token_expires_at,
			scope,
			id_token,
			password,
			created_at,
			updated_at
	`,
		validatedAccount.ID,
		validatedAccount.UserID,
		validatedAccount.AccountID,
		validatedAccount.ProviderID,
		validatedAccount.Accesstoken,
		validatedAccount.Refreshtoken,
		validatedAccount.AccesstokenExpiresAt,
		validatedAccount.RefreshtokenExpiresAt,
		validatedAccount.Scope,
		validatedAccount.IDToken,
		validatedAccount.Password,
		validatedAccount.CreatedAt,
		validatedAccount.UpdatedAt,
	)

	account := &entities.Account{}
	if err := row.Scan(
		&account.ID,
		&account.UserID,
		&account.AccountID,
		&account.ProviderID,
		&account.Accesstoken,
		&account.Refreshtoken,
		&account.AccesstokenExpiresAt,
		&account.RefreshtokenExpiresAt,
		&account.Scope,
		&account.IDToken,
		&account.Password,
		&account.CreatedAt,
		&account.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return account, nil
}
func (r *AccountRepository) Update(context context.Context, validatedAccount *entities.ValidatedAccount) (*entities.Account, error) {
	row := r.db.QueryRow(context, `
	UPDATE
		account 
	SET
		user_id = $2,
		account_id = $3,
		provider_id = $4,
		access_token = $5,
		refresh_token = $6,
		access_token_expires_at = $7,
		refresh_token_expires_at = $8,
		scope = $9,
		id_token = $10,
		password = $11,
		created_at = $12,
		updated_at = $13,
	WHERE
		id =  $1
	RETURNING
		id,
		user_id,
		account_id,
		provider_id,
		access_token,
		refresh_token,
		access_token_expires_at,
		refresh_token_expires_at,
		scope,
		id_token,
		password,
		created_at,
		updated_at;
`,
		validatedAccount.ID,
		validatedAccount.UserID,
		validatedAccount.AccountID,
		validatedAccount.ProviderID,
		validatedAccount.Accesstoken,
		validatedAccount.Refreshtoken,
		validatedAccount.AccesstokenExpiresAt,
		validatedAccount.RefreshtokenExpiresAt,
		validatedAccount.Scope,
		validatedAccount.IDToken,
		validatedAccount.Password,
		validatedAccount.CreatedAt,
		validatedAccount.UpdatedAt,
	)

	account := &entities.Account{}
	if err := row.Scan(
		&account.ID,
		&account.UserID,
		&account.AccountID,
		&account.ProviderID,
		&account.Accesstoken,
		&account.Refreshtoken,
		&account.AccesstokenExpiresAt,
		&account.RefreshtokenExpiresAt,
		&account.Scope,
		&account.IDToken,
		&account.Password,
		&account.CreatedAt,
		&account.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return account, nil
}
func (r *AccountRepository) Delete(context context.Context, ID string) error {

	result, err := r.db.Exec(context, `
			DELETE FROM
				account
			WHERE
				id = $1
		`, ID)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("zero rows affected")
	}

	return nil
}
