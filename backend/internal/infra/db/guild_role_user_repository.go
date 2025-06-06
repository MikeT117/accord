package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type GuildRoleUserRepository struct {
	db DBTX
}

func CreateGuildRoleUserRepository(db DBTX) repositories.GuildRoleUserRepository {
	return &GuildRoleUserRepository{db: db}
}
func (r *GuildRoleUserRepository) CreateAssoc(context context.Context, roleID string, userID string) error {
	result, err := r.db.Exec(context, `
			INSERT INTO
				guild_role_user (
					role_id,
					user_id
				)
			VALUES ($1, $2);
		`, roleID, userID,
	)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("rows affected is zero")
	}

	return nil
}

func (r *GuildRoleUserRepository) DeleteAssoc(context context.Context, roleID string, userID string) error {
	result, err := r.db.Exec(context, `
			DELETE FROM
				guild_role_user
			WHERE
				role_id = $1
			AND
				user_id = $2;
		`, roleID, userID,
	)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("rows affected is zero")
	}

	return nil
}

func (r *GuildRoleUserRepository) GetAssocsByUserIDs(context context.Context, userIDs []string) (map[string][]string, error) {
	rows, err := r.db.Query(context, `
		SELECT
			role_id,
			user_id
		FROM
			guild_role_user
		WHERE
			user_id = ANY ($1);
	`, userIDs)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	roleUsersMap := make(map[string][]string)
	for rows.Next() {
		roleUser := &entities.GuildRoleUser{}
		if err := rows.Scan(
			&roleUser.RoleID,
			&roleUser.UserID,
		); err != nil {
			return nil, err
		}

		roleUsersMap[roleUser.UserID] = append(roleUsersMap[roleUser.UserID], roleUser.RoleID)
	}

	return roleUsersMap, err
}

func (r *GuildRoleUserRepository) GetAssocsByUserIDAndGuildID(context context.Context, userID string, guildID string) ([]string, error) {
	rows, err := r.db.Query(context, `
		SELECT
			gru.role_id,
		FROM
			guild_role_user gru
		INNER JOIN
			guild_role gr
		WHERE
			user_id = $1
		AND 
			gr.guild_id = $2;
	`, userID, guildID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	roleIDs := []string{}
	for rows.Next() {
		var roleID string
		if err := rows.Scan(
			&roleID,
		); err != nil {
			return nil, err
		}

		roleIDs = append(roleIDs, roleID)
	}

	return roleIDs, err
}
