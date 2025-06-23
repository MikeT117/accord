package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/jackc/pgx/v5"
)

type GuildCategoryRepository struct {
	db DBGetter
}

func CreateGuildCategoryRepository(db DBGetter) repositories.GuildCategoryRepository {
	return &GuildCategoryRepository{db: db}
}

func (r *GuildCategoryRepository) GetByID(ctx context.Context, ID string) (*entities.GuildCategory, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			name,
			created_at,
			updated_at
		FROM
			guild_category
		WHERE
			id = $1;
	`)

	guildCategory := &entities.GuildCategory{}

	if err := row.Scan(
		&guildCategory.ID,
		&guildCategory.Name,
		&guildCategory.CreatedAt,
		&guildCategory.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, wrapUnknownErr("select guild category by id failed", err)
	}

	return guildCategory, nil
}

func (r *GuildCategoryRepository) GetAll(ctx context.Context) ([]*entities.GuildCategory, error) {
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
		return nil, wrapUnknownErr("select all guild categories failed", err)
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
			return nil, wrapUnknownErr("map over select all guild categories failed", err)
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

	if err != nil {
		return wrapUnknownErr("create guild category failed", err)
	}

	return nil
}

func (r *GuildCategoryRepository) Delete(ctx context.Context, ID string) error {
	result, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			guild_category
		WHERE
			id = $1
	`, ID)

	if err != nil {
		return wrapUnknownErr("delete guild category failed", err)
	}

	if result.RowsAffected() != 1 {
		return ErrNotFound
	}

	return nil
}
