package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type GuildMemberRepository struct {
	db DBGetter
}

func CreateGuildMemberRepository(db DBGetter) repositories.GuildMemberRepository {
	return &GuildMemberRepository{db: db}
}

func (r *GuildMemberRepository) GetByID(ctx context.Context, ID string, guildID string) (*entities.GuildMember, error) {
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
	`, ID, guildID)

	guildMember := &entities.GuildMember{}
	err := row.Scan(
		&guildMember.UserID,
		&guildMember.GuildID,
		&guildMember.Nickname,
		&guildMember.AvatarID,
		&guildMember.BannerID,
		&guildMember.CreatedAt,
		&guildMember.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return guildMember, nil
}

func (r *GuildMemberRepository) GetByIDs(ctx context.Context, IDs []string, guildID string) (map[string]*entities.GuildMember, error) {
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
		return nil, err
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
			return nil, err
		}

		guildMembersMap[guildMember.UserID] = guildMember
	}

	return guildMembersMap, nil
}

// TODO: add pagination
func (r *GuildMemberRepository) GetByGuildID(ctx context.Context, guildID string) ([]*entities.GuildMember, []string, error) {
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
			guild_id = $1;
	`, guildID)

	if err != nil {
		return nil, []string{}, err
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
			return nil, []string{}, err
		}

		guildMembers = append(guildMembers, guildMember)
		guildMemberIDs = append(guildMemberIDs, guildMember.UserID)
	}

	return guildMembers, guildMemberIDs, nil
}

func (r *GuildMemberRepository) GetByUserID(ctx context.Context, userID string) (map[string]*entities.GuildMember, []string, error) {
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
		return nil, []string{}, err
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
			return nil, []string{}, err
		}

		guildIDs = append(guildIDs, guildMember.GuildID)
		guildMembers[guildMember.GuildID] = guildMember
	}

	return guildMembers, guildIDs, nil
}

func (r *GuildMemberRepository) GetGuildIDsByUserID(ctx context.Context, userID string) ([]string, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			guild_id,
		FROM
			guild_member
		WHERE
			user_id = $1;
	`, userID)

	if err != nil {
		return []string{}, err
	}

	defer rows.Close()

	guildIDs := []string{}
	for rows.Next() {
		var guildID string
		if err := rows.Scan(
			&guildID,
		); err != nil {
			return []string{}, err
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

	return err

}
func (r *GuildMemberRepository) Update(ctx context.Context, guildMember *entities.GuildMember) error {
	_, err := r.db(ctx).Exec(ctx, `
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

	return err
}

func (r *GuildMemberRepository) Delete(ctx context.Context, ID string) error {
	result, err := r.db(ctx).Exec(ctx, `
			DELETE FROM
				guild_member
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
