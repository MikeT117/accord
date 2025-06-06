package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type GuildCategoryRepository struct {
	db DBTX
}

func CreateGuildCategoryRepository(db DBTX) repositories.GuildCategoryRepository {
	return &GuildCategoryRepository{db: db}
}

func (r *GuildCategoryRepository) Get(context context.Context, ID string) ([]*entities.GuildCategory, error) {
	rows, err := r.db.Query(context, `
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

func (r *GuildCategoryRepository) Create(context context.Context, ValidatedGuildCategory *entities.ValidatedGuildCategory) (*entities.GuildCategory, error) {
	row := r.db.QueryRow(context, `
		INSERT INTO
			guild_category (
				id,
				name,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4)
		RETURNING
			id,
			name,
			created_at,
			updated_at;
	`,
		ValidatedGuildCategory.ID,
		ValidatedGuildCategory.Name,
		ValidatedGuildCategory.CreatedAt,
		ValidatedGuildCategory.UpdatedAt,
	)

	guildCategory := &entities.GuildCategory{}
	if err := row.Scan(
		&guildCategory.ID,
		&guildCategory.Name,
		&guildCategory.CreatedAt,
		&guildCategory.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return guildCategory, nil
}

func (r *GuildCategoryRepository) Delete(context context.Context, ID string) error {
	result, err := r.db.Exec(context, `
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
