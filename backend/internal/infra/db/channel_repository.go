package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type ChannelRepository struct {
	db DBGetter
}

func CreateChannelRepository(db DBGetter) repositories.ChannelRepository {
	return &ChannelRepository{db: db}
}

func (r *ChannelRepository) GetByID(ctx context.Context, ID uuid.UUID) (*entities.Channel, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			creator_id,
			guild_id,
			parent_id,
			name,
			topic,
			channel_type,
			created_at,
			updated_at
		FROM
			channel
		WHERE
			id = $1;
	`, ID)

	channel := &entities.Channel{}
	if err := row.Scan(
		&channel.ID,
		&channel.CreatorID,
		&channel.GuildID,
		&channel.ParentID,
		&channel.Name,
		&channel.Topic,
		&channel.ChannelType,
		&channel.CreatedAt,
		&channel.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select channel by id failed", err)
	}

	return channel, nil
}

func (r *ChannelRepository) GetByIDAndGuildID(ctx context.Context, ID uuid.UUID, guildID uuid.UUID) (*entities.Channel, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			creator_id,
			guild_id,
			parent_id,
			name,
			topic,
			channel_type,
			created_at,
			updated_at
		FROM
			channel
		WHERE
			id = $1
		AND
			guild_id = $2;
	`, ID, guildID)

	channel := &entities.Channel{}
	if err := row.Scan(
		&channel.ID,
		&channel.CreatorID,
		&channel.GuildID,
		&channel.ParentID,
		&channel.Name,
		&channel.Topic,
		&channel.ChannelType,
		&channel.CreatedAt,
		&channel.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select channel by id and guild id failed", err)
	}

	return channel, nil
}

func (r *ChannelRepository) GetByIDAndGuildIDAndParentID(ctx context.Context, ID uuid.UUID, guildID uuid.UUID, parentID uuid.UUID) (*entities.Channel, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			creator_id,
			guild_id,
			parent_id,
			name,
			topic,
			channel_type,
			created_at,
			updated_at
		FROM
			channel
		WHERE
			id = $1
		AND
			guild_id = $2
		AND
			parent_id = $3;
	`, ID, guildID, parentID)

	channel := &entities.Channel{}
	if err := row.Scan(
		&channel.ID,
		&channel.CreatorID,
		&channel.GuildID,
		&channel.ParentID,
		&channel.Name,
		&channel.Topic,
		&channel.ChannelType,
		&channel.CreatedAt,
		&channel.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select channel by id, guild id and parent id failed", err)
	}

	return channel, nil
}

func (r *ChannelRepository) GetIDsSyncedWithParentByParentID(ctx context.Context, parentID uuid.UUID) ([]uuid.UUID, error) {
	rows, err := r.db(ctx).Query(ctx, `
		WITH parent_roles AS (
			SELECT
				ARRAY_AGG(role_id) AS role_ids
			FROM
				guild_role_channel
			WHERE
				channel_id = $1
		),
		children AS (
			SELECT
				id
			FROM
				channel
			WHERE
				parent_id = $1
		),
		child_roles AS (
			SELECT
				c.id,
				ARRAY_AGG(grc.role_id) AS role_ids
			FROM
				children c
			LEFT JOIN
				guild_role_channel grc ON grc.channel_id = c.id
			GROUP BY
				c.id
		)

		SELECT
			cr.id
		FROM
			child_roles cr,
			parent_roles pr
		WHERE
			cr.role_ids = pr.role_ids;
	`, parentID)

	if err != nil {
		return nil, wrapUnknownErr("select channels by parent id with sync failed", err)
	}

	defer rows.Close()
	channelIDs := []uuid.UUID{}
	for rows.Next() {
		var channelID uuid.UUID
		if err := rows.Scan(
			&channelID,
		); err != nil {
			return nil, wrapUnknownErr("map over select channels by parent id with sync failed", err)
		}

		channelIDs = append(channelIDs, channelID)
	}

	return channelIDs, nil
}

func (r *ChannelRepository) GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*entities.Channel, []uuid.UUID, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			creator_id,
			guild_id,
			parent_id,
			name,
			topic,
			channel_type,
			created_at,
			updated_at
		FROM
			channel
		WHERE
			guild_id = $1;
	`, guildID)

	if err != nil {
		return nil, nil, wrapUnknownErr("select channels by guild id failed", err)
	}

	defer rows.Close()
	channels := []*entities.Channel{}
	channelIDs := []uuid.UUID{}
	for rows.Next() {
		channel := &entities.Channel{}
		if err := rows.Scan(
			&channel.ID,
			&channel.CreatorID,
			&channel.GuildID,
			&channel.ParentID,
			&channel.Name,
			&channel.Topic,
			&channel.ChannelType,
			&channel.CreatedAt,
			&channel.UpdatedAt,
		); err != nil {
			return nil, nil, wrapUnknownErr("map over select channels by guild id failed", err)
		}

		channels = append(channels, channel)
		channelIDs = append(channelIDs, channel.ID)
	}

	return channels, channelIDs, nil
}

func (r *ChannelRepository) GetMapByGuildIDs(ctx context.Context, guildIDs []uuid.UUID) (map[uuid.UUID][]*entities.Channel, []uuid.UUID, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			creator_id,
			guild_id,
			parent_id,
			name,
			topic,
			channel_type,
			created_at,
			updated_at
		FROM
			channel
		WHERE
			guild_id = ANY($1);
	`, guildIDs)

	if err != nil {
		return nil, nil, wrapUnknownErr("select channels by guild ids failed", err)
	}

	defer rows.Close()

	channelsMap := make(map[uuid.UUID][]*entities.Channel)
	channelIDs := []uuid.UUID{}
	for rows.Next() {
		channel := &entities.Channel{}
		if err := rows.Scan(
			&channel.ID,
			&channel.CreatorID,
			&channel.GuildID,
			&channel.ParentID,
			&channel.Name,
			&channel.Topic,
			&channel.ChannelType,
			&channel.CreatedAt,
			&channel.UpdatedAt,
		); err != nil {
			return nil, nil, wrapUnknownErr("map over select channels by guild ids failed", err)
		}

		channelIDs = append(channelIDs, channel.ID)
		channelsMap[*channel.GuildID] = append(channelsMap[*channel.GuildID], channel)
	}

	return channelsMap, channelIDs, err
}

func (r *ChannelRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entities.Channel, []uuid.UUID, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			c.id,
			c.creator_id,
			c.guild_id,
			c.parent_id,
			c.name,
			c.topic,
			c.channel_type,
			c.created_at,
			c.updated_at
		FROM
			channel c
		INNER JOIN
			channel_user cu ON c.id = cu.channel_id
		WHERE
			cu.user_id = $1;
	`, userID)

	if err != nil {
		return nil, nil, wrapUnknownErr("select channels by user id failed", err)

	}

	defer rows.Close()
	channels := []*entities.Channel{}
	channelIDs := []uuid.UUID{}
	for rows.Next() {
		channel := &entities.Channel{}
		if err := rows.Scan(
			&channel.ID,
			&channel.CreatorID,
			&channel.GuildID,
			&channel.ParentID,
			&channel.Name,
			&channel.Topic,
			&channel.ChannelType,
			&channel.CreatedAt,
			&channel.UpdatedAt,
		); err != nil {
			return nil, nil, wrapUnknownErr("map over select channels by user id failed", err)
		}

		channels = append(channels, channel)
		channelIDs = append(channelIDs, channel.ID)
	}

	return channels, channelIDs, nil
}

func (r *ChannelRepository) Create(ctx context.Context, channel *entities.Channel) error {

	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			channel(
				id,
				creator_id,
				guild_id,
				parent_id,
				name,
				topic,
				channel_type,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
	`,
		&channel.ID,
		&channel.CreatorID,
		channel.GuildID,
		channel.ParentID,
		channel.Name,
		channel.Topic,
		&channel.ChannelType,
		&channel.CreatedAt,
		&channel.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("insert channel failed", err)
	}

	return nil
}

func (r *ChannelRepository) Update(ctx context.Context, channel *entities.Channel) error {

	result, err := r.db(ctx).Exec(ctx, `
		UPDATE
			channel
		SET
			creator_id = $2,
			guild_id = $3,
			parent_id = $4,
			name = $5,
			topic = $6,
			channel_type = $7,
			created_at = $8,
			updated_at = $9
		WHERE
			id = $1;
	`,
		&channel.ID,
		&channel.CreatorID,
		channel.GuildID,
		channel.ParentID,
		channel.Name,
		channel.Topic,
		&channel.ChannelType,
		&channel.CreatedAt,
		&channel.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("update channel failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil

}

func (r *ChannelRepository) Delete(ctx context.Context, ID uuid.UUID) error {
	result, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			channel
		WHERE
			id = $1;
	`, ID)

	if err != nil {
		return wrapUnknownErr("delete channel failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *ChannelRepository) GetUsersByChannelID(ctx context.Context, channelID uuid.UUID) ([]*entities.User, error) {
	rows, err := r.db(ctx).Query(ctx, `
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
		return nil, wrapUnknownErr("select users by channel id failed", err)
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
			return nil, wrapUnknownErr("map over select users by channel id failed", err)
		}

		users = append(users, user)
	}

	return users, nil
}

func (r *ChannelRepository) GetUserIDsByChannelID(ctx context.Context, channelID uuid.UUID) ([]uuid.UUID, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			user_id
		FROM
			channel_user
		WHERE
			channel_id = $1;
	`, channelID)

	if err != nil {
		return nil, wrapUnknownErr("select user ids by channel id failed", err)
	}

	defer rows.Close()

	userIDs := []uuid.UUID{}
	for rows.Next() {
		var userID uuid.UUID
		if err := rows.Scan(
			&userID,
		); err != nil {
			return nil, wrapUnknownErr("map over select user ids by channel id failed", err)
		}

		userIDs = append(userIDs, userID)
	}

	return userIDs, err
}

func (r *ChannelRepository) VerifyUserChannelMembership(ctx context.Context, userID uuid.UUID, channelID uuid.UUID) error {
	var result *string
	err := r.db(ctx).QueryRow(ctx, `
		SELECT
			user_id
		FROM
			channel_user
		WHERE
			user_id = $1
		AND
			channel_id = $2;
	`, userID, channelID).Scan(&result)

	if err != nil {
		return wrapUnknownErr("select user ids by channel id and user id failed", err)
	}

	return err
}

func (r *ChannelRepository) GetMapUsersByChannelIDs(ctx context.Context, channelIDs []uuid.UUID) (map[uuid.UUID][]*entities.User, error) {
	rows, err := r.db(ctx).Query(ctx, `
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
			"user" u
		INNER JOIN
			channel_user cu ON u.id = cu.user_id
		WHERE
			cu.channel_id = ANY($1);
	`, channelIDs)

	if err != nil {
		return nil, wrapUnknownErr("select users by channel ids failed", err)
	}

	defer rows.Close()

	users := make(map[uuid.UUID][]*entities.User)
	for rows.Next() {
		user := &entities.User{}
		var channelID uuid.UUID
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
			return nil, wrapUnknownErr("map over select users by channel ids failed", err)
		}
		users[channelID] = append(users[channelID], user)
	}

	return users, nil

}

func (r *ChannelRepository) AssociateUser(ctx context.Context, channelID uuid.UUID, userID uuid.UUID) error {
	result, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			channel_user (
				user_id,
				channel_id
			)
		VALUES ($1, $2);
	`)

	if err != nil {
		return wrapUnknownErr("insert channel user association failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *ChannelRepository) DisassociateUser(ctx context.Context, channelID uuid.UUID, userID uuid.UUID) error {
	result, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			channel_user
		WHERE
			channel_id = $1
		AND
			user_ud = $2;
	`)

	if err != nil {
		return wrapUnknownErr("delete channel user association failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
