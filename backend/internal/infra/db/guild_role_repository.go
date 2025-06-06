package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type GuildRoleRepository struct {
	db DBTX
}

func CreateGuildRoleRepository(db DBTX) repositories.GuildRoleRepository {
	return &GuildRoleRepository{
		db: db,
	}
}

func (r *GuildRoleRepository) GetByID(context context.Context, ID string) (*entities.GuildRole, error) {
	row := r.db.QueryRow(context, `
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
		return nil, err
	}

	return role, nil
}
func (r *GuildRoleRepository) GetByGuildID(context context.Context, guildID string) ([]*entities.GuildRole, []string, error) {
	rows, err := r.db.Query(context, `
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
		return nil, []string{}, err
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
			return nil, []string{}, err
		}
		roleIDs = append(roleIDs, role.ID)
		roles = append(roles, role)
	}

	return roles, roleIDs, nil
}

func (r *GuildRoleRepository) GetByNameAndGuildID(context context.Context, name string, guildID string) (*entities.GuildRole, error) {
	row := r.db.QueryRow(context, `
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
		return nil, err
	}

	return role, nil
}

func (r *GuildRoleRepository) GetByGuildIDs(context context.Context, guildIDs []string) (map[string][]*entities.GuildRole, []string, error) {
	rows, err := r.db.Query(context, `
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
		return nil, []string{}, err
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
			return nil, []string{}, err
		}

		roleIDs = append(roleIDs, role.ID)
		rolesMap[role.GuildID] = append(rolesMap[role.GuildID], role)
	}

	return rolesMap, roleIDs, err
}

func (r *GuildRoleRepository) Create(context context.Context, validatedGuildRole *entities.ValidatedGuildRole) (*entities.GuildRole, error) {
	row := r.db.QueryRow(context, `
		INSERT INTO
			guild_role (
				id,
				guild_id,
				name,
				permissions,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING
			id,
			guild_id,
			name,
			permissions,
			created_at,
			updated_at;
	`,
		validatedGuildRole.ID,
		validatedGuildRole.GuildID,
		validatedGuildRole.Name,
		validatedGuildRole.Permissions,
		validatedGuildRole.CreatedAt,
		validatedGuildRole.UpdatedAt,
	)

	guildRole := &entities.GuildRole{}
	if err := row.Scan(
		&guildRole.ID,
		&guildRole.GuildID,
		&guildRole.Name,
		&guildRole.Permissions,
		&guildRole.CreatedAt,
		&guildRole.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return guildRole, nil
}
func (r *GuildRoleRepository) Update(context context.Context, validatedGuildRole *entities.ValidatedGuildRole) (*entities.GuildRole, error) {
	row := r.db.QueryRow(context, `
		UPDATE
			guild_role
		SET
			guild_id = $2,
			name = $3,
			permissions = $4,
			created_at = $5,
			updated_at = $6,
			
		WHERE
			id = $1
		RETURNING
			id,
			guild_id,
			name,
			permissions,
			created_at,
			updated_at;
	`,
		validatedGuildRole.ID,
		validatedGuildRole.GuildID,
		validatedGuildRole.Name,
		validatedGuildRole.Permissions,
		validatedGuildRole.CreatedAt,
		validatedGuildRole.UpdatedAt,
	)

	guildRole := &entities.GuildRole{}
	if err := row.Scan(
		&guildRole.ID,
		&guildRole.GuildID,
		&guildRole.Name,
		&guildRole.Permissions,
		&guildRole.CreatedAt,
		&guildRole.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return guildRole, nil
}

func (r *GuildRoleRepository) Delete(context context.Context, ID string) error {
	result, err := r.db.Exec(context, `
			DELETE FROM
				guild_role
			WHERE
				id = $1
		`, ID,
	)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("rows affected is zero")
	}

	return nil
}

func (r *GuildRoleRepository) GetPermissionByUserIDAndGuildID(context context.Context, userID string, guildID string) (int32, error) {
	row := r.db.QueryRow(context, `
		Select
			COALESCE(
				bit_or(gr.permissions), -1)::int as permissions
			FROM
				guild_role gr
			INNER JOIN
				guild_role_user gru ON gru.role_id = gr.id
			WHERE
				gru.user_id = $1;
			AND
				gr.guild_id = $2
	`, userID, guildID)

	var permissions int32

	if err := row.Scan(&permissions); err != nil {
		return -1, err
	}

	return permissions, nil
}

func (r *GuildRoleRepository) GetPermissionByUserIDAndChannelID(context context.Context, userID string, channelID string) (int32, error) {
	row := r.db.QueryRow(context, `
		Select
			COALESCE(
				bit_or(gr.permissions), -1)::int as permissions
			FROM
				guild_role gr
			INNER JOIN
				guild_role_user gru ON gru.role_id = gr.id
			INNER JOIN
				guild_role_channel grc ON grc.role_id = gr.id
			WHERE
				gru.user_id = $1;
			AND
				grc.channel_id = $2
	`, userID, channelID)

	var permissions int32

	if err := row.Scan(&permissions); err != nil {
		return -1, err
	}

	return permissions, nil
}
