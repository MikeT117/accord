package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type ChannelUserRepository struct {
	db DBTX
}

func CreateChannelUserRepository(db DBTX) repositories.ChannelUserRepository {
	return &ChannelUserRepository{db: db}
}

func (r *ChannelUserRepository) GetByChannelID(context context.Context, channelID string) ([]*entities.User, error) {
	rows, err := r.db.Query(context, `
		SELECT
			u.id,
			u.username,
			u.display_name,
			u.email,
			u.email_verified,
			u.public_flags,
			u.relationship_count,
			u.avatar_id,
			u.banner_id,
			u.created_at,
			u.updated_at
		FROM
			user u
		INNER JOIN
			channel_user cu ON u.id = cu.user_id
		WHERE
			cu.channel_id = $1;
	`, channelID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	users := []*entities.User{}

	for rows.Next() {
		user := &entities.User{}
		if err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.DisplayName,
			&user.Email,
			&user.EmailVerified,
			&user.PublicFlags,
			&user.RelationshipCount,
			&user.AvatarID,
			&user.BannerID,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	return users, nil
}

func (r *ChannelUserRepository) GetByChannelIDs(context context.Context, channelIDs []string) (map[string][]*entities.User, error) {
	rows, err := r.db.Query(context, `
		SELECT
			cu.channel_id,
			u.id,
			u.username,
			u.display_name,
			u.email,
			u.email_verified,
			u.public_flags,
			u.relationship_count,
			u.avatar_id,
			u.banner_id,
			u.created_at,
			u.updated_at
		FROM
			user u
		INNER JOIN
			channel_user cu ON u.id = cu.user_id
		WHERE
			cu.channel_id = ANY($1);
	`, channelIDs)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	users := make(map[string][]*entities.User)
	for rows.Next() {
		user := &entities.User{}
		var channelID string
		if err := rows.Scan(
			&channelID,
			&user.ID,
			&user.Username,
			&user.DisplayName,
			&user.Email,
			&user.EmailVerified,
			&user.PublicFlags,
			&user.RelationshipCount,
			&user.AvatarID,
			&user.BannerID,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			return nil, err
		}
		users[channelID] = append(users[channelID], user)
	}

	return users, nil

}

func (r *ChannelUserRepository) Create(context context.Context, channelID string, userID string) error {
	result, err := r.db.Exec(context, `
		INSERT INTO
			channel_user (
				user_id,
				channel_id
			)
		VALUES ($1, $2);
	`)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("rows affected is zero")
	}

	return nil
}
func (r *ChannelUserRepository) Delete(context context.Context, channelID string, userID string) error {
	result, err := r.db.Exec(context, `
		DELETE FROM
			channel_user
		WHERE
			channel_id = $1
		AND
			user_ud = $2;
	`)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("rows affected is zero")
	}

	return nil
}
