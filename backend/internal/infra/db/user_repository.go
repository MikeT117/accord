package db

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type UserRepository struct {
	db DBTX
}

func CreateUserRepository(db DBTX) repositories.UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByID(context context.Context, ID string) (*entities.User, error) {
	row := r.db.QueryRow(context, `
		SELECT
			id,
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
			user
		WHERE
			id = $1;
	`, ID)

	user := &entities.User{}

	if err := row.Scan(
		&user.ID,
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
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) GetByEmail(context context.Context, email string) (*entities.User, error) {
	row := r.db.QueryRow(context, `
		SELECT
			id,
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
			user
		WHERE
			email = $1;
	`, email)

	user := &entities.User{}

	if err := row.Scan(
		&user.ID,
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
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) Create(context context.Context, validatedUser *entities.ValidatedUser) (*entities.User, error) {
	row := r.db.QueryRow(context, `
		INSERT INTO
			user (
				id,
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
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING
			id,
			username,
			display_name,
			email,
			email_verified,
			public_flags,
			relationship_count,
			avatar_id,
			banner_id,
			created_at,
			updated_at;
	`,
		validatedUser.ID,
		validatedUser.Username,
		validatedUser.DisplayName,
		validatedUser.Email,
		validatedUser.EmailVerified,
		validatedUser.PublicFlags,
		validatedUser.RelationshipCount,
		validatedUser.AvatarID,
		validatedUser.BannerID,
		validatedUser.CreatedAt,
		validatedUser.UpdatedAt,
	)

	user := &entities.User{}

	if err := row.Scan(
		&user.ID,
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
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) Update(context context.Context, validatedUser *entities.ValidatedUser) (*entities.User, error) {
	row := r.db.QueryRow(context, `
		UPDATE
			user
		SET
			name = $2,
			email = $3,
			email_verified = $4,
			image = $5,
			created_at = $6,
			updated_at = $7
		WHERE
			id = $1
		RETURNING
			id,
			name,
			email,
			email_verified,
			image,
			created_at,
			updated_at;
	`,
		validatedUser.ID,
		validatedUser.Username,
		validatedUser.DisplayName,
		validatedUser.Email,
		validatedUser.EmailVerified,
		validatedUser.PublicFlags,
		validatedUser.RelationshipCount,
		validatedUser.AvatarID,
		validatedUser.BannerID,
		validatedUser.CreatedAt,
		validatedUser.UpdatedAt,
	)

	user := &entities.User{}

	if err := row.Scan(
		&user.ID,
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
		return nil, err
	}

	return user, nil
}
