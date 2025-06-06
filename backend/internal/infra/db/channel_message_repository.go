package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type ChannelMessageRepository struct {
	db DBTX
}

func CreateChannelMessageRepository(db DBTX) repositories.ChannelMessageRepository {
	return &ChannelMessageRepository{
		db: db,
	}
}

func (r *ChannelMessageRepository) GetByID(context context.Context, ID string) (*entities.ChannelMessage, error) {
	messageRow := r.db.QueryRow(context, `
		SELECT
			id,
			content,
			pinned,
			flag,
			author_id,
			channel_id,
			guild_id,
			created_at,
			updated_at
		FROM
			channel_message
		WHERE
			id = $1;
	`, ID)

	channelMessage := &entities.ChannelMessage{}
	if err := messageRow.Scan(
		&channelMessage.ID,
		&channelMessage.Content,
		&channelMessage.Pinned,
		&channelMessage.Flag,
		&channelMessage.AuthorID,
		&channelMessage.ChannelID,
		&channelMessage.GuildID,
		&channelMessage.CreatedAt,
		&channelMessage.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return channelMessage, nil
}
func (r *ChannelMessageRepository) GetByAuthorID(context context.Context, authorID string, before int64, limit int) ([]*entities.ChannelMessage, error) {
	rows, err := r.db.Query(context, `
		SELECT
			id,
			content,
			pinned,
			flag,
			author_id,
			channel_id,
			guild_id,
			created_at,
			updated_at
		FROM
			channel_message
		WHERE
			author_id = $1;
	`, authorID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	channelMessages := []*entities.ChannelMessage{}

	for rows.Next() {
		channelMessage := &entities.ChannelMessage{}
		if err := rows.Scan(
			&channelMessage.ID,
			&channelMessage.Content,
			&channelMessage.Pinned,
			&channelMessage.Flag,
			&channelMessage.AuthorID,
			&channelMessage.ChannelID,
			&channelMessage.GuildID,
			&channelMessage.CreatedAt,
			&channelMessage.UpdatedAt,
		); err != nil {
			return nil, err
		}

		channelMessages = append(channelMessages, channelMessage)
	}

	return channelMessages, nil
}
func (r *ChannelMessageRepository) GetByChannelID(context context.Context, channelID string, before int64, limit int) ([]*entities.ChannelMessage, error) {
	rows, err := r.db.Query(context, `
		SELECT
			id,
			content,
			pinned,
			flag,
			author_id,
			channel_id,
			guild_id,
			created_at,
			updated_at
		FROM
			channel_message
		WHERE
			channel_id = $1;
	`, channelID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	channelMessages := []*entities.ChannelMessage{}

	for rows.Next() {
		channelMessage := &entities.ChannelMessage{}
		if err := rows.Scan(
			&channelMessage.ID,
			&channelMessage.Content,
			&channelMessage.Pinned,
			&channelMessage.Flag,
			&channelMessage.AuthorID,
			&channelMessage.ChannelID,
			&channelMessage.GuildID,
			&channelMessage.CreatedAt,
			&channelMessage.UpdatedAt,
		); err != nil {
			return nil, err
		}

		channelMessages = append(channelMessages, channelMessage)
	}

	return channelMessages, nil
}
func (r *ChannelMessageRepository) Create(context context.Context, validatedChannelMessage *entities.ValidatedChannelMessage) (*entities.ChannelMessage, error) {
	row := r.db.QueryRow(context, `
		INSERT INTO
			channel_message(
				id,
				content,
				pinned,
				flag,
				author_id,
				channel_id,
				guild_id,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING
			id,
			content,
			pinned,
			flag,
			author_id,
			channel_id,
			guild_id,
			created_at,
			updated_at;
	`,
		validatedChannelMessage.ID,
		validatedChannelMessage.Content,
		validatedChannelMessage.Pinned,
		validatedChannelMessage.Flag,
		validatedChannelMessage.AuthorID,
		validatedChannelMessage.ChannelID,
		validatedChannelMessage.GuildID,
		validatedChannelMessage.CreatedAt,
		validatedChannelMessage.UpdatedAt,
	)

	channelMessage := &entities.ChannelMessage{}
	if err := row.Scan(
		&channelMessage.ID,
		&channelMessage.Content,
		&channelMessage.Pinned,
		&channelMessage.Flag,
		&channelMessage.AuthorID,
		&channelMessage.ChannelID,
		&channelMessage.GuildID,
		&channelMessage.CreatedAt,
		&channelMessage.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return channelMessage, nil
}
func (r *ChannelMessageRepository) Update(context context.Context, validatedChannelMessage *entities.ValidatedChannelMessage) (*entities.ChannelMessage, error) {
	row := r.db.QueryRow(context, `
		UPDATE
			channel_message
		SET
			content = $2,
			pinned = $3,
			flag = $4,
			author_id = $5,
			channel_id = $6,
			guild_id = $7,
			created_at = $8,
			updated_at = $9,
		WHERE
			id = $1
		RETURNING
			id,
			content,
			pinned,
			flag,
			author_id,
			channel_id,
			guild_id,
			created_at,
			updated_at;
	`,
		validatedChannelMessage.ID,
		validatedChannelMessage.Content,
		validatedChannelMessage.Pinned,
		validatedChannelMessage.Flag,
		validatedChannelMessage.AuthorID,
		validatedChannelMessage.ChannelID,
		validatedChannelMessage.GuildID,
		validatedChannelMessage.CreatedAt,
		validatedChannelMessage.UpdatedAt,
	)

	channelMessage := &entities.ChannelMessage{}
	if err := row.Scan(
		&channelMessage.ID,
		&channelMessage.Content,
		&channelMessage.Pinned,
		&channelMessage.Flag,
		&channelMessage.AuthorID,
		&channelMessage.ChannelID,
		&channelMessage.GuildID,
		&channelMessage.CreatedAt,
		&channelMessage.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return channelMessage, nil
}
func (r *ChannelMessageRepository) Delete(context context.Context, ID string) error {
	result, err := r.db.Exec(context, `
		DELETE FROM
			channel_message
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
