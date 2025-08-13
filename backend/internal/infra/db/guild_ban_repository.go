package db

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/google/uuid"
)

type GuildBanRepository struct {
	db DBGetter
}

func CreateGuildBanRepository(db DBGetter) repositories.GuildBanRepository {
	return &GuildBanRepository{db: db}
}

func (r *GuildBanRepository) GetByGuildID(ctx context.Context, guildID uuid.UUID, before time.Time, limit int) ([]*entities.GuildBan, []uuid.UUID, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			user_id,
			guild_id,
			reason,
			created_at,
			updated_at
		FROM
			guild_ban
		WHERE
			guild_id = $1
		AND
			created_at::timestamp(0) < $2
		LIMIT
			$3;
	`, guildID, before, limit)

	if err != nil {
		return nil, nil, wrapUnknownErr("select guild bans by guild id failed", err)
	}

	defer rows.Close()

	guildBans := []*entities.GuildBan{}
	userIDs := []uuid.UUID{}

	for rows.Next() {
		guildBan := &entities.GuildBan{}
		var userID uuid.UUID

		if err := rows.Scan(
			&guildBan.UserID,
			&guildBan.GuildID,
			&guildBan.Reason,
			&guildBan.CreatedAt,
			&guildBan.UpdatedAt,
		); err != nil {
			return nil, nil, wrapUnknownErr("map over select guild bans by guild id failed", err)
		}

		guildBans = append(guildBans, guildBan)
		userIDs = append(userIDs, userID)
	}

	return guildBans, userIDs, nil
}

func (r *GuildBanRepository) Create(ctx context.Context, guildBan *entities.GuildBan) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			guild_bans(
				user_id,
				guild_id,
				reason,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5);
	`,
		&guildBan.UserID,
		&guildBan.GuildID,
		&guildBan.Reason,
		&guildBan.CreatedAt,
		&guildBan.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("insert guild ban failed", err)
	}

	return nil
}

func (r *GuildBanRepository) Delete(ctx context.Context, userID uuid.UUID, guildID uuid.UUID) error {
	result, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			guild_bans
		WHERE
			user_id = $1
		AND
			guild_id = $2;
	`, userID, guildID)

	if err != nil {
		return wrapUnknownErr("delete guild ban failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
