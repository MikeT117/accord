package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type GuildCategoryRepository struct {
	db DBGetter
}

func CreateGuildCategoryRepository(db DBGetter) repositories.GuildCategoryRepository {
	return &GuildCategoryRepository{db: db}
}

func (r *GuildCategoryRepository) Get(ctx context.Context, ID string) ([]*entities.GuildCategory, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			name,
			created_at,
			updated_at
		FROM
			guild_category;
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	guildCategories := []*entities.GuildCategory{}

	for rows.Next() {
		guildCategory := entities.GuildCategory{}

		if err := rows.Scan(
			&guildCategory.ID,
			&guildCategory.Name,
			&guildCategory.CreatedAt,
			&guildCategory.UpdatedAt,
		); err != nil {
			return nil, err
		}

		guildCategories = append(guildCategories, &guildCategory)
	}

	return guildCategories, nil
}

func (r *GuildCategoryRepository) Create(ctx context.Context, guildCategory *entities.GuildCategory) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			guild_category (
				id,
				name,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4);
	`,
		guildCategory.ID,
		guildCategory.Name,
		guildCategory.CreatedAt,
		guildCategory.UpdatedAt,
	)

	return err
}

func (r *GuildCategoryRepository) Delete(ctx context.Context, ID string) error {
	result, err := r.db(ctx).Exec(ctx, `
			DELETE FROM
				guild_category
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
