package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type AccountRepository struct {
	db DBGetter
}

func CreateAccountRepository(db DBGetter) repositories.AccountRepository {
	return &AccountRepository{db: db}
}

func (r *AccountRepository) GetByID(ctx context.Context, ID uuid.UUID) (*entities.Account, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
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
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select account by id failed", err)
	}

	return account, nil
}
func (r *AccountRepository) GetByUserID(ctx context.Context, userID uuid.UUID) (*entities.Account, error) {
	row := r.db(ctx).QueryRow(ctx, `
	SELECT
		id,
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
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select account by user id failed", err)
	}

	return account, nil
}

func (r *AccountRepository) GetByProviderID(ctx context.Context, ID string) (*entities.Account, error) {
	row := r.db(ctx).QueryRow(ctx, `
	SELECT
		id,
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
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select account by provider id failed", err)
	}

	return account, nil
}
func (r *AccountRepository) Create(ctx context.Context, validatedAccount *entities.Account) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			account (
				id,
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
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
	`,
		&validatedAccount.ID,
		validatedAccount.ProviderID,
		validatedAccount.Accesstoken,
		validatedAccount.Refreshtoken,
		validatedAccount.AccesstokenExpiresAt,
		validatedAccount.RefreshtokenExpiresAt,
		validatedAccount.Scope,
		validatedAccount.IDToken,
		validatedAccount.Password,
		&validatedAccount.CreatedAt,
		&validatedAccount.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("insert account failed", err)
	}

	return nil
}
func (r *AccountRepository) Update(ctx context.Context, validatedAccount *entities.Account) error {
	result, err := r.db(ctx).Exec(ctx, `
		UPDATE
			account
		SET
			provider_id = $2,
			access_token = $3,
			refresh_token = $4,
			access_token_expires_at = $5,
			refresh_token_expires_at = $6,
			scope = $7,
			id_token = $8,
			password = $9,
			created_at = $10,
			updated_at = $11,
		WHERE
			id =  $1;
	`,
		&validatedAccount.ID,
		validatedAccount.ProviderID,
		validatedAccount.Accesstoken,
		validatedAccount.Refreshtoken,
		validatedAccount.AccesstokenExpiresAt,
		validatedAccount.RefreshtokenExpiresAt,
		validatedAccount.Scope,
		validatedAccount.IDToken,
		validatedAccount.Password,
		&validatedAccount.CreatedAt,
		&validatedAccount.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("update account failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *AccountRepository) Delete(ctx context.Context, ID uuid.UUID) error {

	result, err := r.db(ctx).Exec(ctx, `
			DELETE FROM
				account
			WHERE
				id = $1
		`, ID)

	if err != nil {
		return wrapUnknownErr("delete account failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
