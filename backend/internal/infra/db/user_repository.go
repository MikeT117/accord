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

type UserRepository struct {
	db DBGetter
}

func CreateUserRepository(db DBGetter) repositories.UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByID(ctx context.Context, ID uuid.UUID) (*entities.User, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			account_id,
			username,
			display_name,
			email,
			email_verified,
			public_flags,
			relationship_count,
			avatar_id,
			banner_id,
			created_at,
			updated_at
		FROM
			"user"
		WHERE
			id = $1;
	`, ID)

	user := &entities.User{}

	if err := row.Scan(
		&user.ID,
		&user.AccountID,
		&user.Username,
		&user.DisplayName,
		&user.Email,
		&user.EmailVerified,
		&user.PublicFlags,
		&user.RelationshipCount,
		&user.AvatarID,
		&user.BannerID,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select user by id failed", err)
	}

	return user, nil
}

func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*entities.User, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			account_id,
			username,
			display_name,
			email,
			email_verified,
			public_flags,
			relationship_count,
			avatar_id,
			banner_id,
			created_at,
			updated_at
		FROM
			"user"
		WHERE
			username = $1;
	`, username)

	user := &entities.User{}

	if err := row.Scan(
		&user.ID,
		&user.AccountID,
		&user.Username,
		&user.DisplayName,
		&user.Email,
		&user.EmailVerified,
		&user.PublicFlags,
		&user.RelationshipCount,
		&user.AvatarID,
		&user.BannerID,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select user by username failed", err)
	}

	return user, nil
}

func (r *UserRepository) GetByAccountID(ctx context.Context, accountID uuid.UUID) (*entities.User, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			account_id,
			username,
			display_name,
			email,
			email_verified,
			public_flags,
			relationship_count,
			avatar_id,
			banner_id,
			created_at,
			updated_at
		FROM
			"user"
		WHERE
			account_id = $1;
	`, accountID)

	user := &entities.User{}

	if err := row.Scan(
		&user.ID,
		&user.AccountID,
		&user.Username,
		&user.DisplayName,
		&user.Email,
		&user.EmailVerified,
		&user.PublicFlags,
		&user.RelationshipCount,
		&user.AvatarID,
		&user.BannerID,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select user by account id failed", err)
	}

	return user, nil
}

func (r *UserRepository) GetMapByIDs(ctx context.Context, IDs []uuid.UUID) (map[uuid.UUID]*entities.User, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			account_id,
			username,
			display_name,
			email,
			email_verified,
			public_flags,
			relationship_count,
			avatar_id,
			banner_id,
			created_at,
			updated_at
		FROM
			"user"
		WHERE
			id = ANY($1);
	`, IDs)

	if err != nil {
		return nil, wrapUnknownErr("select users by ids failed", err)
	}

	usersMap := make(map[uuid.UUID]*entities.User)

	for rows.Next() {
		user := &entities.User{}
		if err := rows.Scan(
			&user.ID,
			&user.AccountID,
			&user.Username,
			&user.DisplayName,
			&user.Email,
			&user.EmailVerified,
			&user.PublicFlags,
			&user.RelationshipCount,
			&user.AvatarID,
			&user.BannerID,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			return nil, wrapUnknownErr("map over select users by ids failed", err)
		}
		usersMap[user.ID] = user
	}

	return usersMap, nil
}

func (r *UserRepository) GetByIDs(ctx context.Context, IDs []uuid.UUID) ([]*entities.User, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			account_id,
			username,
			display_name,
			email,
			email_verified,
			public_flags,
			relationship_count,
			avatar_id,
			banner_id,
			created_at,
			updated_at
		FROM
			"user"
		WHERE
			id = ANY($1);
	`, IDs)

	if err != nil {
		return nil, wrapUnknownErr("select users by ids failed", err)
	}

	users := []*entities.User{}

	for rows.Next() {
		user := &entities.User{}
		if err := rows.Scan(
			&user.ID,
			&user.AccountID,
			&user.Username,
			&user.DisplayName,
			&user.Email,
			&user.EmailVerified,
			&user.PublicFlags,
			&user.RelationshipCount,
			&user.AvatarID,
			&user.BannerID,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			return nil, wrapUnknownErr("map over select users by ids failed", err)
		}
		users = append(users, user)
	}

	return users, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			account_id,
			username,
			display_name,
			email,
			email_verified,
			public_flags,
			relationship_count,
			avatar_id,
			banner_id,
			created_at,
			updated_at
		FROM
			"user"
		WHERE
			email = $1;
	`, email)

	user := &entities.User{}

	if err := row.Scan(
		&user.ID,
		&user.AccountID,
		&user.Username,
		&user.DisplayName,
		&user.Email,
		&user.EmailVerified,
		&user.PublicFlags,
		&user.RelationshipCount,
		&user.AvatarID,
		&user.BannerID,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select user by email failed", err)
	}

	return user, nil
}

func (r *UserRepository) Create(ctx context.Context, user *entities.User) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			"user" (
				id,
				account_id,
				username,
				display_name,
				email,
				email_verified,
				public_flags,
				relationship_count,
				avatar_id,
				banner_id,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
	`,
		&user.ID,
		&user.AccountID,
		&user.Username,
		&user.DisplayName,
		&user.Email,
		&user.EmailVerified,
		&user.PublicFlags,
		&user.RelationshipCount,
		user.AvatarID,
		user.BannerID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("insert user failed", err)
	}

	return nil
}

func (r *UserRepository) Update(ctx context.Context, user *entities.User) error {
	result, err := r.db(ctx).Exec(ctx, `
		UPDATE
			"user"
		SET
			display_name = $2,
			email = $3,
			email_verified = $4,
			public_flags = $5,
			avatar_id = $6,
			banner_id = $7,
			updated_at = $8
		WHERE
			id = $1;
		`,
		&user.ID,
		&user.DisplayName,
		&user.Email,
		&user.EmailVerified,
		&user.PublicFlags,
		user.AvatarID,
		user.BannerID,
		&user.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("update user failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
