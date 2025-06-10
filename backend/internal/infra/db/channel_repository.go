package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type ChannelRepository struct {
	db DBGetter
}

func CreateChannelRepository(db DBGetter) repositories.ChannelRepository {
	return &ChannelRepository{db: db}
}

func (r *ChannelRepository) GetByID(ctx context.Context, ID string) (*entities.Channel, error) {
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
		return nil, err
	}

	return channel, nil
}

func (r *ChannelRepository) GetByGuildID(ctx context.Context, guildID string) ([]*entities.Channel, []string, error) {
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
		return nil, []string{}, err

	}

	defer rows.Close()
	channels := []*entities.Channel{}
	channelIDs := []string{}
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
			return nil, []string{}, err
		}

		channels = append(channels, channel)
		channelIDs = append(channelIDs, channel.ID)
	}

	return channels, channelIDs, nil
}

func (r *ChannelRepository) GetByGuildIDs(ctx context.Context, guildIDs []string) (map[string][]*entities.Channel, []string, error) {
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
		return nil, []string{}, err
	}

	defer rows.Close()

	channelsMap := make(map[string][]*entities.Channel)
	channelIDs := []string{}
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
			return nil, []string{}, err
		}

		channelIDs = append(channelIDs, channel.ID)
		channelsMap[*channel.GuildID] = append(channelsMap[*channel.GuildID], channel)
	}

	return channelsMap, channelIDs, err
}

func (r *ChannelRepository) GetByUserID(ctx context.Context, userID string) ([]*entities.Channel, []string, error) {
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
		return nil, []string{}, err

	}

	defer rows.Close()
	channels := []*entities.Channel{}
	channelIDs := []string{}
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
			return nil, []string{}, err
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
		&channel.GuildID,
		&channel.ParentID,
		&channel.Name,
		&channel.Topic,
		&channel.ChannelType,
		&channel.CreatedAt,
		&channel.UpdatedAt,
	)

	return err
}

func (r *ChannelRepository) Update(ctx context.Context, channel *entities.Channel) error {

	_, err := r.db(ctx).Exec(ctx, `
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
		&channel.GuildID,
		&channel.ParentID,
		&channel.Name,
		&channel.Topic,
		&channel.ChannelType,
		&channel.CreatedAt,
		&channel.UpdatedAt,
	)

	return err

}

func (r *ChannelRepository) Delete(ctx context.Context, ID string) error {
	result, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			channel
		WHERE
			id = $1;
	`, ID)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("rows affected is zero")
	}

	return nil
}

func (r *ChannelRepository) GetUsersByChannelID(ctx context.Context, channelID string) ([]*entities.User, error) {
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

func (r *ChannelRepository) GetUsersByChannelIDs(ctx context.Context, channelIDs []string) (map[string][]*entities.User, error) {
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

func (r *ChannelRepository) AssociateUser(ctx context.Context, channelID string, userID string) error {
	result, err := r.db(ctx).Exec(ctx, `
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

func (r *ChannelRepository) DisassociateUser(ctx context.Context, channelID string, userID string) error {
	result, err := r.db(ctx).Exec(ctx, `
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
