package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type GuildInviteRepository struct {
	db DBGetter
}

func CreateGuildInviteRepository(db DBGetter) repositories.GuildInviteRepository {
	return &GuildInviteRepository{db: db}
}

func (r *GuildInviteRepository) GetByID(ctx context.Context, ID string) (*entities.GuildInvite, error) {
	row := r.db(ctx).QueryRow(ctx, `
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

func (r *GuildInviteRepository) GetByGuildID(ctx context.Context, guildID string) ([]*entities.GuildInvite, error) {
	rows, err := r.db(ctx).Query(ctx, `
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

func (r *GuildInviteRepository) Create(ctx context.Context, guildInvite *entities.GuildInvite) error {
	_, err := r.db(ctx).Exec(ctx, `
			INSERT INTO
				guild_invite(
					id,
					used_count,
					guild_id,
					created_at,
					expires_at
				)
			VALUES ($1, $2, $3, $4, $5);
		`,
		guildInvite.ID,
		guildInvite.UsedCount,
		guildInvite.GuildID,
		guildInvite.CreatedAt,
		guildInvite.ExpiresAt,
	)

	return err
}

func (r *GuildInviteRepository) Delete(ctx context.Context, ID string) error {
	result, err := r.db(ctx).Exec(ctx, `
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
