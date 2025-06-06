package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type GuildRoleChannelRepository struct {
	db DBTX
}

func CreateGuildRoleChannelRepository(db DBTX) repositories.GuildRoleChannelRepository {
	return &GuildRoleChannelRepository{db: db}
}

func (r *GuildRoleChannelRepository) CreateAssoc(context context.Context, roleID string, channelID string) error {
	result, err := r.db.Exec(context, `
			INSERT INTO
				guild_role_channel (
					role_id,
					channel_id
				)
			VALUES ($1, $2);
		`, roleID, channelID,
	)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("rows affected is zero")
	}

	return nil
}

func (r *GuildRoleChannelRepository) DeleteAssoc(context context.Context, roleID string, channelID string) error {
	result, err := r.db.Exec(context, `
			DELETE FROM
				guild_role_channel
			WHERE
				role_id = $1
			AND
				channel_id = $2;
		`, roleID, channelID,
	)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("rows affected is zero")
	}

	return nil
}

func (r *GuildRoleChannelRepository) GetRoleIDsByChannelIDs(context context.Context, channelIDs []string) (map[string][]string, error) {
	rows, err := r.db.Query(context, `
		SELECT
			role_id,
			channel_id
		FROM
			guild_role_channel
		WHERE
			channel_id = ANY ($1);
	`, channelIDs)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	roleChannelsMap := make(map[string][]string)
	for rows.Next() {
		roleChannel := &entities.GuildRoleChannel{}
		if err := rows.Scan(
			&roleChannel.RoleID,
			&roleChannel.ChannelID,
		); err != nil {
			return nil, err
		}

		roleChannelsMap[roleChannel.ChannelID] = append(roleChannelsMap[roleChannel.ChannelID], roleChannel.RoleID)
	}

	return roleChannelsMap, err
}

func (r *GuildRoleChannelRepository) GetRoleIDsByChannelID(context context.Context, channelID string) ([]string, error) {
	rows, err := r.db.Query(context, `
		SELECT
			role_id,
		FROM
			guild_role_channel
		WHERE
			channel_id = $1;
	`, channelID)

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
