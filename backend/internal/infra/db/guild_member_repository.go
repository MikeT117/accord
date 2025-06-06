package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type GuildMemberRepository struct {
	db DBTX
}

func CreateGuildMemberRepository(db DBTX) repositories.GuildMemberRepository {
	return &GuildMemberRepository{db: db}
}

func (r *GuildMemberRepository) GetByID(context context.Context, ID string, guildID string) (*entities.GuildMember, error) {
	row := r.db.QueryRow(context, `
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

// TODO: add pagination
func (r *GuildMemberRepository) GetByGuildID(context context.Context, guildID string) ([]*entities.GuildMember, []string, error) {
	rows, err := r.db.Query(context, `
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

func (r *GuildMemberRepository) GetByUserID(context context.Context, userID string) (map[string]*entities.GuildMember, []string, error) {
	rows, err := r.db.Query(context, `
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

func (r *GuildMemberRepository) GetGuildIDsByUserID(context context.Context, userID string) ([]string, error) {
	rows, err := r.db.Query(context, `
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

func (r *GuildMemberRepository) Create(context context.Context, validatedGuildMember *entities.ValidatedGuildMember) (*entities.GuildMember, error) {
	row := r.db.QueryRow(context, `
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
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING
			user_id,
			guild_id,
			nickname,
			avatar_id,
			banner_id,
			created_at,
			updated_at;
	`,
		validatedGuildMember.UserID,
		validatedGuildMember.GuildID,
		validatedGuildMember.Nickname,
		validatedGuildMember.AvatarID,
		validatedGuildMember.BannerID,
		validatedGuildMember.CreatedAt,
		validatedGuildMember.UpdatedAt,
	)

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
		return nil, err
	}

	return guildMember, nil
}
func (r *GuildMemberRepository) Update(context context.Context, validatedGuildMember *entities.ValidatedGuildMember) (*entities.GuildMember, error) {
	row := r.db.QueryRow(context, `
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
			guild_id = $2
		RETURNING
			user_id,
			guild_id,
			nickname,
			avatar_id,
			banner_id,
			created_at,
			updated_at;
	`,
		validatedGuildMember.UserID,
		validatedGuildMember.GuildID,
		validatedGuildMember.Nickname,
		validatedGuildMember.AvatarID,
		validatedGuildMember.BannerID,
		validatedGuildMember.CreatedAt,
		validatedGuildMember.UpdatedAt,
	)

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
		return nil, err
	}

	return guildMember, nil
}
func (r *GuildMemberRepository) Delete(context context.Context, ID string) error {
	result, err := r.db.Exec(context, `
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
