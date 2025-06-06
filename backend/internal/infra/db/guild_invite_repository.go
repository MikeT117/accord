package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type GuildInviteRepository struct {
	db DBTX
}

func CreateGuildInviteRepository(db DBTX) repositories.GuildInviteRepository {
	return &GuildInviteRepository{db: db}
}

func (r *GuildInviteRepository) GetByID(context context.Context, ID string) (*entities.GuildInvite, error) {
	row := r.db.QueryRow(context, `
		SELECT
			id,
			used_count,
			guild_id,
			created_at,
			expires_at
		FROM
			guild_invite
		WHERE
			id = $1;
	`, ID)

	guildInvite := &entities.GuildInvite{}
	if err := row.Scan(
		&guildInvite.ID,
		&guildInvite.UsedCount,
		&guildInvite.GuildID,
		&guildInvite.CreatedAt,
		&guildInvite.ExpiresAt,
	); err != nil {
		return nil, err
	}

	return guildInvite, nil
}

func (r *GuildInviteRepository) GetByGuildID(context context.Context, guildID string) ([]*entities.GuildInvite, error) {
	rows, err := r.db.Query(context, `
		SELECT
			id,
			used_count,
			guild_id,
			created_at,
			expires_at
		FROM
			guild_invite
		WHERE
			id = $1;
	`, guildID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	guildInvites := []*entities.GuildInvite{}

	for rows.Next() {
		guildInvite := &entities.GuildInvite{}
		if err := rows.Scan(
			&guildInvite.ID,
			&guildInvite.UsedCount,
			&guildInvite.GuildID,
			&guildInvite.CreatedAt,
			&guildInvite.ExpiresAt,
		); err != nil {
			return nil, err
		}

		guildInvites = append(guildInvites, guildInvite)
	}

	return guildInvites, nil
}

func (r *GuildInviteRepository) Create(context context.Context, validatedGuildInvite *entities.ValidatedGuildInvite) (*entities.GuildInvite, error) {
	row := r.db.QueryRow(context, `
			INSERT INTO
				guild_invite(
					id,
					used_count,
					guild_id,
					created_at,
					expires_at
				)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING
				id,
				used_count,
				guild_id,
				created_at,
				expires_at;
		`,
		validatedGuildInvite.ID,
		validatedGuildInvite.UsedCount,
		validatedGuildInvite.GuildID,
		validatedGuildInvite.CreatedAt,
		validatedGuildInvite.ExpiresAt,
	)

	guildInvite := &entities.GuildInvite{}
	if err := row.Scan(
		&guildInvite.ID,
		&guildInvite.UsedCount,
		&guildInvite.GuildID,
		&guildInvite.CreatedAt,
		&guildInvite.ExpiresAt,
	); err != nil {
		return nil, err
	}

	return guildInvite, nil
}

func (r *GuildInviteRepository) Delete(context context.Context, ID string) error {
	result, err := r.db.Exec(context, `
			DELETE FROM
				guild_invite
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
