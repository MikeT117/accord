package db

import (
	"context"
	"errors"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type GuildMemberRepository struct {
	db DBGetter
}

func CreateGuildMemberRepository(db DBGetter) repositories.GuildMemberRepository {
	return &GuildMemberRepository{db: db}
}

func (r *GuildMemberRepository) GetByID(ctx context.Context, userID uuid.UUID, guildID uuid.UUID) (*entities.GuildMember, error) {
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

func (r *GuildMemberRepository) GetMapByIDs(ctx context.Context, IDs []uuid.UUID, guildID uuid.UUID) (map[uuid.UUID]*entities.GuildMember, error) {
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

	guildMembersMap := make(map[uuid.UUID]*entities.GuildMember)
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

func (r *GuildMemberRepository) GetMapByIDsAndGuildIDs(ctx context.Context, IDs []uuid.UUID, guildIDs []uuid.UUID) (map[uuid.UUID]map[uuid.UUID]*entities.GuildMember, error) {
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
			guild_id = ANY($2);
	`, IDs, guildIDs)

	if err != nil {
		return nil, wrapUnknownErr("select guild members by ids failed", err)
	}

	guildMembersMap := make(map[uuid.UUID]map[uuid.UUID]*entities.GuildMember)
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

		if guildMembersMap[guildMember.GuildID] == nil {
			guildMembersMap[guildMember.GuildID] = make(map[uuid.UUID]*entities.GuildMember)
		}

		guildMembersMap[guildMember.GuildID][guildMember.UserID] = guildMember
	}

	return guildMembersMap, nil
}

func (r *GuildMemberRepository) GetByGuildID(ctx context.Context, guildID uuid.UUID, before time.Time, limit int) ([]*entities.GuildMember, []uuid.UUID, error) {
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
			created_at::timestamp(0) < $2
		LIMIT
			$3;
	`, guildID, before, limit)

	if err != nil {
		return nil, nil, wrapUnknownErr("select guild members by guild id failed", err)
	}

	defer rows.Close()

	guildMembers := []*entities.GuildMember{}
	guildMemberIDs := []uuid.UUID{}

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
			return nil, nil, wrapUnknownErr("map over select guild members by guild id failed", err)
		}

		guildMembers = append(guildMembers, guildMember)
		guildMemberIDs = append(guildMemberIDs, guildMember.UserID)
	}

	return guildMembers, guildMemberIDs, nil
}

func (r *GuildMemberRepository) GetMapByUserID(ctx context.Context, userID uuid.UUID) (map[uuid.UUID]*entities.GuildMember, []uuid.UUID, error) {
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
		return nil, nil, wrapUnknownErr("select guild members by user id failed", err)
	}

	defer rows.Close()

	guildMembers := make(map[uuid.UUID]*entities.GuildMember)
	guildIDs := []uuid.UUID{}
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
			return nil, nil, wrapUnknownErr("map over select guild members by user id failed", err)
		}

		guildIDs = append(guildIDs, guildMember.GuildID)
		guildMembers[guildMember.GuildID] = guildMember
	}

	return guildMembers, guildIDs, nil
}

func (r *GuildMemberRepository) GetGuildIDsByUserID(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			guild_id
		FROM
			guild_member
		WHERE
			user_id = $1;
	`, userID)

	if err != nil {
		return nil, wrapUnknownErr("select guild IDs by user id failed", err)
	}

	defer rows.Close()

	guildIDs := []uuid.UUID{}
	for rows.Next() {
		var guildID uuid.UUID
		if err := rows.Scan(
			&guildID,
		); err != nil {
			return nil, wrapUnknownErr("map over select guild IDs by user id failed", err)
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
		&guildMember.UserID,
		&guildMember.GuildID,
		guildMember.Nickname,
		guildMember.AvatarID,
		guildMember.BannerID,
		&guildMember.CreatedAt,
		&guildMember.UpdatedAt,
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
		&guildMember.UserID,
		&guildMember.GuildID,
		guildMember.Nickname,
		guildMember.AvatarID,
		guildMember.BannerID,
		&guildMember.CreatedAt,
		&guildMember.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("update guild member failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *GuildMemberRepository) Delete(ctx context.Context, userID uuid.UUID, guildID uuid.UUID) error {
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

func (r *GuildMemberRepository) GetAssignedByGuildIDAndRoleID(ctx context.Context, guildID uuid.UUID, roleID uuid.UUID, before time.Time, limit int) ([]*entities.GuildMember, []uuid.UUID, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			g.user_id,
			g.guild_id,
			g.nickname,
			g.avatar_id,
			g.banner_id,
			g.created_at,
			g.updated_at
		FROM
			guild_member g
		INNER JOIN
			guild_role_user gru ON gru.user_id = g.user_id
		WHERE
			g.guild_id = $1
		AND
			gru.role_id = $2
		AND
			g.created_at::timestamp(0) < $3
		LIMIT
			$4;
	`, guildID, roleID, before, limit)

	if err != nil {
		return nil, nil, wrapUnknownErr("select guild members by guild id and role id failed", err)
	}

	defer rows.Close()

	guildMembers := []*entities.GuildMember{}
	guildMemberIDs := []uuid.UUID{}

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
			return nil, nil, wrapUnknownErr("map over select guild members by guild id and role id failed", err)
		}

		guildMembers = append(guildMembers, guildMember)
		guildMemberIDs = append(guildMemberIDs, guildMember.UserID)
	}

	return guildMembers, guildMemberIDs, nil
}

func (r *GuildMemberRepository) GetUnassignedByGuildIDAndRoleID(ctx context.Context, guildID uuid.UUID, roleID uuid.UUID, before time.Time, limit int) ([]*entities.GuildMember, []uuid.UUID, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			g.user_id,
			g.guild_id,
			g.nickname,
			g.avatar_id,
			g.banner_id,
			g.created_at,
			g.updated_at
		FROM
			guild_member g
		LEFT JOIN
			guild_role_user gru ON gru.user_id = g.user_id AND gru.role_id = $2
		WHERE
			g.guild_id = $1
		AND
			g.created_at::timestamp(0) < $3
		AND
			gru.role_id IS NULL
		LIMIT
			$4;
	`, guildID, roleID, before, limit)

	if err != nil {
		return nil, nil, wrapUnknownErr("select guild members by guild id and role id failed", err)
	}

	defer rows.Close()

	guildMembers := []*entities.GuildMember{}
	guildMemberIDs := []uuid.UUID{}

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
			return nil, nil, wrapUnknownErr("map over select guild members by guild id and role id failed", err)
		}

		guildMembers = append(guildMembers, guildMember)
		guildMemberIDs = append(guildMemberIDs, guildMember.UserID)
	}

	return guildMembers, guildMemberIDs, nil
}
