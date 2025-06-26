package db

import (
	"context"
	"errors"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/jackc/pgx/v5"
)

type GuildMemberRepository struct {
	db DBGetter
}

func CreateGuildMemberRepository(db DBGetter) repositories.GuildMemberRepository {
	return &GuildMemberRepository{db: db}
}

func (r *GuildMemberRepository) GetByID(ctx context.Context, userID string, guildID string) (*entities.GuildMember, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			user_id,
			guild_id,
			nickname,
			avatar_id,
			banner_id,
			created_at,
			updated_at
		FROM
			guild_member
		WHERE
			user_id = $1
		AND
			guild_id = $2;
	`, userID, guildID)

	guildMember := &entities.GuildMember{}
	if err := row.Scan(
		&guildMember.UserID,
		&guildMember.GuildID,
		&guildMember.Nickname,
		&guildMember.AvatarID,
		&guildMember.BannerID,
		&guildMember.CreatedAt,
		&guildMember.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select guild member by id failed", err)
	}

	return guildMember, nil
}

func (r *GuildMemberRepository) GetMapByIDs(ctx context.Context, IDs []string, guildID string) (map[string]*entities.GuildMember, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			user_id,
			guild_id,
			nickname,
			avatar_id,
			banner_id,
			created_at,
			updated_at
		FROM
			guild_member
		WHERE
			user_id = ANY($1)
		AND
			guild_id = $2;
	`, IDs, guildID)

	if err != nil {
		return nil, wrapUnknownErr("select guild members by ids failed", err)
	}

	guildMembersMap := make(map[string]*entities.GuildMember)
	for rows.Next() {
		guildMember := &entities.GuildMember{}
		if err := rows.Scan(
			&guildMember.UserID,
			&guildMember.GuildID,
			&guildMember.Nickname,
			&guildMember.AvatarID,
			&guildMember.BannerID,
			&guildMember.CreatedAt,
			&guildMember.UpdatedAt,
		); err != nil {
			return nil, wrapUnknownErr("map over select guild members by ids failed", err)
		}

		guildMembersMap[guildMember.UserID] = guildMember
	}

	return guildMembersMap, nil
}

func (r *GuildMemberRepository) GetByGuildID(ctx context.Context, guildID string, before time.Time, limit int) ([]*entities.GuildMember, []string, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			user_id,
			guild_id,
			nickname,
			avatar_id,
			banner_id,
			created_at,
			updated_at
		FROM
			guild_member
		WHERE
			guild_id = $1
		AND
			created_at < $2
		LIMIT
			$3;
	`, guildID, before, limit)

	if err != nil {
		return nil, []string{}, wrapUnknownErr("select guild members by guild id failed", err)
	}

	defer rows.Close()

	guildMembers := []*entities.GuildMember{}
	guildMemberIDs := []string{}

	for rows.Next() {
		guildMember := &entities.GuildMember{}
		if err := rows.Scan(
			&guildMember.UserID,
			&guildMember.GuildID,
			&guildMember.Nickname,
			&guildMember.AvatarID,
			&guildMember.BannerID,
			&guildMember.CreatedAt,
			&guildMember.UpdatedAt,
		); err != nil {
			return nil, []string{}, wrapUnknownErr("map over select guild members by guild id failed", err)
		}

		guildMembers = append(guildMembers, guildMember)
		guildMemberIDs = append(guildMemberIDs, guildMember.UserID)
	}

	return guildMembers, guildMemberIDs, nil
}

func (r *GuildMemberRepository) GetMapByUserID(ctx context.Context, userID string) (map[string]*entities.GuildMember, []string, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			user_id,
			guild_id,
			nickname,
			avatar_id,
			banner_id,
			created_at,
			updated_at
		FROM
			guild_member
		WHERE
			user_id = $1;
	`, userID)

	if err != nil {
		return nil, []string{}, wrapUnknownErr("select guild members by user id failed", err)
	}

	defer rows.Close()

	guildMembers := make(map[string]*entities.GuildMember)
	guildIDs := []string{}
	for rows.Next() {
		guildMember := &entities.GuildMember{}
		if err := rows.Scan(
			&guildMember.UserID,
			&guildMember.GuildID,
			&guildMember.Nickname,
			&guildMember.AvatarID,
			&guildMember.BannerID,
			&guildMember.CreatedAt,
			&guildMember.UpdatedAt,
		); err != nil {
			return nil, []string{}, wrapUnknownErr("map over select guild members by user id failed", err)
		}

		guildIDs = append(guildIDs, guildMember.GuildID)
		guildMembers[guildMember.GuildID] = guildMember
	}

	return guildMembers, guildIDs, nil
}

func (r *GuildMemberRepository) GetGuildIDsByUserID(ctx context.Context, userID string) ([]string, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			guild_id
		FROM
			guild_member
		WHERE
			user_id = $1;
	`, userID)

	if err != nil {
		return []string{}, wrapUnknownErr("select guild IDs by user id failed", err)
	}

	defer rows.Close()

	guildIDs := []string{}
	for rows.Next() {
		var guildID string
		if err := rows.Scan(
			&guildID,
		); err != nil {
			return []string{}, wrapUnknownErr("map over select guild IDs by user id failed", err)
		}

		guildIDs = append(guildIDs, guildID)

	}

	return guildIDs, nil
}

func (r *GuildMemberRepository) Create(ctx context.Context, guildMember *entities.GuildMember) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			guild_member (
				user_id,
				guild_id,
				nickname,
				avatar_id,
				banner_id,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7);
	`,
		guildMember.UserID,
		guildMember.GuildID,
		guildMember.Nickname,
		guildMember.AvatarID,
		guildMember.BannerID,
		guildMember.CreatedAt,
		guildMember.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("insert guild member failed", err)
	}

	return nil

}
func (r *GuildMemberRepository) Update(ctx context.Context, guildMember *entities.GuildMember) error {
	result, err := r.db(ctx).Exec(ctx, `
		UPDATE
			guild_member
		SET
			user_id = $1,
			guild_id  = $2,
			nickname = $3,
			avatar_id = $4,
			banner_id = $5,
			created_at = $6,
			updated_at = $7
		WHERE
			user_id = $1
		AND
			guild_id = $2;
	`,
		guildMember.UserID,
		guildMember.GuildID,
		guildMember.Nickname,
		guildMember.AvatarID,
		guildMember.BannerID,
		guildMember.CreatedAt,
		guildMember.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("update guild member failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *GuildMemberRepository) Delete(ctx context.Context, userID string, guildID string) error {
	result, err := r.db(ctx).Exec(ctx, `
			DELETE FROM
				guild_member
			WHERE
				user_id = $1
			AND 
				guild_id = $2
		`, userID, guildID)

	if err != nil {
		return wrapUnknownErr("delete guild member failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
