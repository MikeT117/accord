package db

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type UserRepository struct {
	db DBGetter
}

func CreateUserRepository(db DBGetter) repositories.UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByID(ctx context.Context, ID string) (*entities.User, error) {
	row := r.db(ctx).QueryRow(ctx, `
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

func (r *UserRepository) GetByIDs(ctx context.Context, IDs []string) (map[string]*entities.User, error) {
	rows, err := r.db(ctx).Query(ctx, `
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
	`, IDs)

	if err != nil {
		return nil, err
	}

	usersMap := make(map[string]*entities.User)

	for rows.Next() {
		user := &entities.User{}
		if err := rows.Scan(
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
		usersMap[user.ID] = user
	}

	return usersMap, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	row := r.db(ctx).QueryRow(ctx, `
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

func (r *UserRepository) Create(ctx context.Context, user *entities.User) error {
	_, err := r.db(ctx).Exec(ctx, `
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
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
	`,
		user.ID,
		user.Username,
		user.DisplayName,
		user.Email,
		user.EmailVerified,
		user.PublicFlags,
		user.RelationshipCount,
		user.AvatarID,
		user.BannerID,
		user.CreatedAt,
		user.UpdatedAt,
	)

	return err
}

func (r *UserRepository) Update(ctx context.Context, user *entities.User) error {
	_, err := r.db(ctx).Exec(ctx, `
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
			id = $1;
	`,
		user.ID,
		user.Username,
		user.DisplayName,
		user.Email,
		user.EmailVerified,
		user.PublicFlags,
		user.RelationshipCount,
		user.AvatarID,
		user.BannerID,
		user.CreatedAt,
		user.UpdatedAt,
	)

	return err
}
