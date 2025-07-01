package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/jackc/pgx/v5"
)

type GuildRoleRepository struct {
	db DBGetter
}

func CreateGuildRoleRepository(db DBGetter) repositories.GuildRoleRepository {
	return &GuildRoleRepository{
		db: db,
	}
}

func (r *GuildRoleRepository) GetByID(ctx context.Context, ID string) (*entities.GuildRole, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			guild_id,
			name,
			permissions,
			created_at,
			updated_at
		FROM
			guild_role
		WHERE
			id = $1;
	`, ID)

	role := &entities.GuildRole{}
	if err := row.Scan(
		&role.ID,
		&role.GuildID,
		&role.Name,
		&role.Permissions,
		&role.CreatedAt,
		&role.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select guild role by id failed", err)
	}

	return role, nil
}
func (r *GuildRoleRepository) GetByGuildID(ctx context.Context, guildID string) ([]*entities.GuildRole, []string, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			guild_id,
			name,
			permissions,
			created_at,
			updated_at
		FROM
			guild_role
		WHERE
			guild_id = $1;
	`, guildID)

	if err != nil {
		return nil, []string{}, wrapUnknownErr("select guild roles by guild id failed", err)
	}
	defer rows.Close()

	roles := []*entities.GuildRole{}
	roleIDs := []string{}
	for rows.Next() {
		role := &entities.GuildRole{}
		if err := rows.Scan(
			&role.ID,
			&role.GuildID,
			&role.Name,
			&role.Permissions,
			&role.CreatedAt,
			&role.UpdatedAt,
		); err != nil {
			return nil, []string{}, wrapUnknownErr("map over select guild roles by guild id failed", err)
		}
		roleIDs = append(roleIDs, role.ID)
		roles = append(roles, role)
	}

	return roles, roleIDs, nil
}

func (r *GuildRoleRepository) GetByIDs(ctx context.Context, roleIDs []string, guildID string) ([]*entities.GuildRole, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			guild_id,
			name,
			permissions,
			created_at,
			updated_at
		FROM
			guild_role
		WHERE
			id = ANY($1)
		AND 
			guild_id = $2;
	`, roleIDs, guildID)

	if err != nil {
		return nil, wrapUnknownErr("select guild roles by ids failed", err)
	}
	defer rows.Close()

	roles := []*entities.GuildRole{}
	for rows.Next() {
		role := &entities.GuildRole{}
		if err := rows.Scan(
			&role.ID,
			&role.GuildID,
			&role.Name,
			&role.Permissions,
			&role.CreatedAt,
			&role.UpdatedAt,
		); err != nil {
			return nil, wrapUnknownErr("map over select guild roles by ids failed failed", err)
		}
		roles = append(roles, role)
	}

	return roles, nil
}

func (r *GuildRoleRepository) GetByNameAndGuildID(ctx context.Context, name string, guildID string) (*entities.GuildRole, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			guild_id,
			name,
			permissions,
			created_at,
			updated_at
		FROM
			guild_role
		WHERE
			name = $1
		AND
			guild_id = $2;
	`, name, guildID)

	role := &entities.GuildRole{}
	if err := row.Scan(
		&role.ID,
		&role.GuildID,
		&role.Name,
		&role.Permissions,
		&role.CreatedAt,
		&role.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select guild role by name and guild id failed", err)
	}

	return role, nil
}

func (r *GuildRoleRepository) GetMapByGuildIDs(ctx context.Context, guildIDs []string) (map[string][]*entities.GuildRole, []string, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			guild_id,
			name,
			permissions,
			created_at,
			updated_at
		FROM
			guild_role
		WHERE
			guild_id = ANY ($1);
	`, guildIDs)

	if err != nil {
		return nil, []string{}, wrapUnknownErr("select guild roles by guild ids failed", err)
	}

	defer rows.Close()

	rolesMap := make(map[string][]*entities.GuildRole)
	roleIDs := []string{}
	for rows.Next() {
		role := &entities.GuildRole{}
		if err := rows.Scan(
			&role.ID,
			&role.GuildID,
			&role.Name,
			&role.Permissions,
			&role.CreatedAt,
			&role.UpdatedAt,
		); err != nil {
			return nil, []string{}, wrapUnknownErr("map over select guild roles by guild ids failed", err)
		}

		roleIDs = append(roleIDs, role.ID)
		rolesMap[role.GuildID] = append(rolesMap[role.GuildID], role)
	}

	return rolesMap, roleIDs, err
}

func (r *GuildRoleRepository) Create(ctx context.Context, guildRole *entities.GuildRole) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			guild_role (
				id,
				guild_id,
				name,
				permissions,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6);
	`,
		guildRole.ID,
		guildRole.GuildID,
		guildRole.Name,
		guildRole.Permissions,
		guildRole.CreatedAt,
		guildRole.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("insert guild role failed", err)
	}

	return nil

}
func (r *GuildRoleRepository) Update(ctx context.Context, guildRole *entities.GuildRole) error {
	result, err := r.db(ctx).Exec(ctx, `
		UPDATE
			guild_role
		SET
			guild_id = $2,
			name = $3,
			permissions = $4,
			created_at = $5,
			updated_at = $6,
			
		WHERE
			id = $1;
	`,
		guildRole.ID,
		guildRole.GuildID,
		guildRole.Name,
		guildRole.Permissions,
		guildRole.CreatedAt,
		guildRole.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("update guild role failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil

}

func (r *GuildRoleRepository) Delete(ctx context.Context, ID string) error {
	result, err := r.db(ctx).Exec(ctx, `
			DELETE FROM
				guild_role
			WHERE
				id = $1
		`, ID,
	)

	if err != nil {
		return wrapUnknownErr("delete guild role failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *GuildRoleRepository) GetPermissionByUserIDAndGuildID(ctx context.Context, userID string, guildID string) (int32, error) {
	row := r.db(ctx).QueryRow(ctx, `
		Select
			bit_or(gr.permissions) as permissions
		FROM
			guild_role gr
		INNER JOIN
			guild_role_user gru ON gru.role_id = gr.id
		WHERE
			gru.user_id = $1
		AND
			gr.guild_id = $2;
	`, userID, guildID)

	var permissions int32

	if err := row.Scan(&permissions); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return -1, domain.ErrEntityNotFound
		}
		return -1, wrapUnknownErr("select guild permissions by user id failed", err)
	}

	return permissions, nil
}

func (r *GuildRoleRepository) GetPermissionByUserIDAndChannelID(ctx context.Context, userID string, channelID string) (int32, error) {
	row := r.db(ctx).QueryRow(ctx, `
		Select
			bit_or(gr.permissions) as permissions
		FROM
			guild_role gr
		INNER JOIN
			guild_role_user gru ON gru.role_id = gr.id
		INNER JOIN
			guild_role_channel grc ON grc.role_id = gr.id
		WHERE
			gru.user_id = $1
		AND
			grc.channel_id = $2;
	`, userID, channelID)

	var permissions int32

	if err := row.Scan(&permissions); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return -1, domain.ErrEntityNotFound
		}
		return -1, wrapUnknownErr("select channel permissions by user id failed", err)
	}

	return permissions, nil
}

func (r *GuildRoleRepository) AssociateUser(ctx context.Context, roleID string, userID string) error {
	result, err := r.db(ctx).Exec(ctx, `
			INSERT INTO
				guild_role_user (
					role_id,
					user_id
				)
			VALUES ($1, $2)
			ON CONFLICT (role_id, user_id)
			DO UPDATE SET role_id = $1, user_id = $2;
		`, roleID, userID,
	)

	if err != nil {
		return wrapUnknownErr("insert guild role user association failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *GuildRoleRepository) DisassociateUser(ctx context.Context, roleID string, userID string) error {
	result, err := r.db(ctx).Exec(ctx, `
			DELETE FROM
				guild_role_user
			WHERE
				role_id = $1
			AND
				user_id = $2;
		`, roleID, userID,
	)

	if err != nil {
		return wrapUnknownErr("delete guild role user association failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *GuildRoleRepository) GetMapRoleIDsByUserIDs(ctx context.Context, userIDs []string) (map[string][]string, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			role_id,
			user_id
		FROM
			guild_role_user
		WHERE
			user_id = ANY ($1);
	`, userIDs)

	if err != nil {
		return nil, wrapUnknownErr("select role ids by user ids failed", err)
	}

	defer rows.Close()

	roleUsersMap := make(map[string][]string)
	for rows.Next() {
		var roleID string
		var userID string
		if err := rows.Scan(
			&roleID,
			&userID,
		); err != nil {
			return nil, wrapUnknownErr("map over select role ids by user ids failed", err)
		}

		roleUsersMap[userID] = append(roleUsersMap[userID], roleID)
	}

	return roleUsersMap, err
}

func (r *GuildRoleRepository) GetRoleIDsByUserIDAndGuildID(ctx context.Context, userID string, guildID string) ([]string, error) {
	rows, err := r.db(ctx).Query(ctx, `
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
		return nil, wrapUnknownErr("select role ids by user id and guild id failed", err)
	}

	defer rows.Close()

	roleIDs := []string{}
	for rows.Next() {
		var roleID string
		if err := rows.Scan(
			&roleID,
		); err != nil {
			return nil, wrapUnknownErr("map over select role ids by user id and guild id failed", err)
		}

		roleIDs = append(roleIDs, roleID)
	}

	return roleIDs, err
}

func (r *GuildRoleRepository) AssociateChannel(ctx context.Context, roleID string, channelID string) error {
	result, err := r.db(ctx).Exec(ctx, `
			INSERT INTO
				guild_role_channel (
					role_id,
					channel_id
				)
			VALUES ($1, $2)
			ON CONFLICT (role_id, channel_id)
			DO UPDATE SET role_id = $1, channel_id = $2;
		`, roleID, channelID,
	)

	if err != nil {
		return wrapUnknownErr("insert role channel association failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *GuildRoleRepository) DisassociateChannel(ctx context.Context, roleID string, channelID string) error {
	result, err := r.db(ctx).Exec(ctx, `
			DELETE FROM
				guild_role_channel
			WHERE
				role_id = $1
			AND
				channel_id = $2;
		`, roleID, channelID,
	)

	if err != nil {
		return wrapUnknownErr("delete role channel association failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *GuildRoleRepository) GetMapRoleIDsByChannelIDs(ctx context.Context, channelIDs []string) (map[string][]string, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			role_id,
			channel_id
		FROM
			guild_role_channel
		WHERE
			channel_id = ANY ($1);
	`, channelIDs)

	if err != nil {
		return nil, wrapUnknownErr("select role ids by channel ids failed", err)
	}

	defer rows.Close()

	roleChannelsMap := make(map[string][]string)
	for rows.Next() {
		var channelID string
		var roleID string
		if err := rows.Scan(
			&roleID,
			&channelID,
		); err != nil {
			return nil, wrapUnknownErr("map over select role ids by channel ids failed", err)
		}

		roleChannelsMap[channelID] = append(roleChannelsMap[channelID], roleID)
	}

	return roleChannelsMap, err
}

func (r *GuildRoleRepository) GetRoleIDsByChannelID(ctx context.Context, channelID string) ([]string, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			role_id
		FROM
			guild_role_channel
		WHERE
			channel_id = $1;
	`, channelID)

	if err != nil {
		return nil, wrapUnknownErr("select role ids by channel id failed", err)
	}

	defer rows.Close()

	roleIDs := []string{}
	for rows.Next() {
		var roleID string
		if err := rows.Scan(
			&roleID,
		); err != nil {
			return nil, wrapUnknownErr("map over select role ids by channel id failed", err)
		}

		roleIDs = append(roleIDs, roleID)

	}

	return roleIDs, err
}

func (r *GuildRoleRepository) GetChannelPermissions(ctx context.Context, channelID string, userID string) (int32, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			COALESCE(bit_or(gr.permissions), -1)::int
		FROM
			guild_role gr
		INNER JOIN
			guild_role_user gru ON gru.role_id = gr.id
		INNER JOIN
			guild_role_channel grc ON grc.role_id = gr.id
		WHERE
			gru.user_id = $1
		AND
			grc.channel_id = $2;
	`, userID, channelID)

	var permissions int32
	if err := row.Scan(&permissions); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return -1, domain.ErrEntityNotFound
		}
		return -1, wrapUnknownErr("select user channel permissions failed", err)
	}

	return permissions, nil
}

func (r *GuildRoleRepository) GetGuildPermissions(ctx context.Context, guildID string, userID string) (int32, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			COALESCE(bit_or(gr.permissions), -1)::int
		FROM
			guild_role gr
		INNER JOIN
			guild_role_user gru ON gru.role_id = gr.id
		WHERE
			gr.guild_id = $1
		AND
			gru.user_id = $2;
	`, guildID, userID)

	var permissions int32
	if err := row.Scan(&permissions); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return -1, domain.ErrEntityNotFound
		}
		return -1, wrapUnknownErr("select user guild permissions failed", err)
	}

	return permissions, nil
}
