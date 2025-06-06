package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type ChannelRepository struct {
	db DBTX
}

func CreateChannelRepository(db DBTX) repositories.ChannelRepository {
	return &ChannelRepository{db: db}
}

func (r *ChannelRepository) GetByID(context context.Context, ID string) (*entities.Channel, error) {
	row := r.db.QueryRow(context, `
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

func (r *ChannelRepository) GetByGuildID(context context.Context, guildID string) ([]*entities.Channel, []string, error) {
	rows, err := r.db.Query(context, `
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

func (r *ChannelRepository) GetByGuildIDs(context context.Context, guildIDs []string) (map[string][]*entities.Channel, []string, error) {
	rows, err := r.db.Query(context, `
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

func (r *ChannelRepository) GetByUserID(context context.Context, userID string) ([]*entities.Channel, []string, error) {
	rows, err := r.db.Query(context, `
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

func (r *ChannelRepository) Create(context context.Context, validatedChannel *entities.ValidatedChannel) (*entities.Channel, error) {

	row := r.db.QueryRow(context, `
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
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING
			id,
			creator_id,
			guild_id,
			parent_id,
			name,
			topic,
			channel_type,
			created_at,
			updated_at;
	`,
		&validatedChannel.ID,
		&validatedChannel.CreatorID,
		&validatedChannel.GuildID,
		&validatedChannel.ParentID,
		&validatedChannel.Name,
		&validatedChannel.Topic,
		&validatedChannel.ChannelType,
		&validatedChannel.CreatedAt,
		&validatedChannel.UpdatedAt,
	)

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

func (r *ChannelRepository) Update(context context.Context, validatedChannel *entities.ValidatedChannel) (*entities.Channel, error) {

	row := r.db.QueryRow(context, `
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
			id = $1
		RETURNING
			id,
			creator_id,
			guild_id,
			parent_id,
			name,
			topic,
			channel_type,
			created_at,
			updated_at;
	`,
		&validatedChannel.ID,
		&validatedChannel.CreatorID,
		&validatedChannel.GuildID,
		&validatedChannel.ParentID,
		&validatedChannel.Name,
		&validatedChannel.Topic,
		&validatedChannel.ChannelType,
		&validatedChannel.CreatedAt,
		&validatedChannel.UpdatedAt,
	)

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

func (r *ChannelRepository) Delete(context context.Context, ID string) error {
	result, err := r.db.Exec(context, `
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
