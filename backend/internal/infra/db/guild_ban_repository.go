package db

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type GuildBanRepository struct {
	db DBGetter
}

func CreateGuildBanRepository(db DBGetter) repositories.GuildBanRepository {
	return &GuildBanRepository{db: db}
}

func (r *GuildBanRepository) GetByUserIDAndGuildID(ctx context.Context, userID string, guildID string) (*entities.GuildBan, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			user_id,
			guild_id,
			reason,
			created_at,
			updated_at
		WHERE
			user_id = $1
		AND
			guild_id = $2;
	`, userID, guildID)

	guildBan := &entities.GuildBan{}
	if err := row.Scan(
		&guildBan.UserID,
		&guildBan.GuildID,
		&guildBan.Reason,
		&guildBan.CreatedAt,
		&guildBan.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return guildBan, nil
}

func (r *GuildBanRepository) GetByGuildID(ctx context.Context, guildID string) ([]*entities.GuildBan, []string, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			user_id,
			guild_id,
			reason,
			created_at,
			updated_at
		WHERE
			guild_id = $1;
	`, guildID)

	if err != nil {
		return nil, []string{}, err
	}

	defer rows.Close()

	guildBans := []*entities.GuildBan{}
	userIDs := []string{}

	for rows.Next() {
		guildBan := &entities.GuildBan{}
		var userID string

		if err := rows.Scan(
			&guildBan.UserID,
			&guildBan.GuildID,
			&guildBan.Reason,
			&guildBan.CreatedAt,
			&guildBan.UpdatedAt,
		); err != nil {
			return nil, []string{}, err
		}

		guildBans = append(guildBans, guildBan)
		userIDs = append(userIDs, userID)
	}

	return guildBans, userIDs, nil
}

func (r *GuildBanRepository) Create(ctx context.Context, guildBan *entities.GuildBan) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			guild_bans(user_id, guild_id, reason, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5);
	`, guildBan.UserID, guildBan.GuildID, guildBan.Reason, guildBan.CreatedAt, guildBan.UpdatedAt)

	if err != nil {
		return err
	}

	return nil
}

func (r *GuildBanRepository) Delete(ctx context.Context, userID string, guildID string) error {
	_, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			guild_bans
		WHERE
			user_id = $1
		AND
			guild_id = $2;
	`, userID, guildID)

	if err != nil {
		return err
	}

	return nil
}
