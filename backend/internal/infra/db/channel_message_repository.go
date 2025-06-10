package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type ChannelMessageRepository struct {
	db DBGetter
}

func CreateChannelMessageRepository(db DBGetter) repositories.ChannelMessageRepository {
	return &ChannelMessageRepository{
		db: db,
	}
}

func (r *ChannelMessageRepository) GetByID(ctx context.Context, ID string) (*entities.ChannelMessage, error) {
	messageRow := r.db(ctx).QueryRow(ctx, `
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
func (r *ChannelMessageRepository) GetByAuthorID(ctx context.Context, authorID string, before int64, limit int) ([]*entities.ChannelMessage, error) {
	rows, err := r.db(ctx).Query(ctx, `
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
func (r *ChannelMessageRepository) GetByChannelID(ctx context.Context, channelID string, before int64, limit int) ([]*entities.ChannelMessage, []string, []string, error) {
	rows, err := r.db(ctx).Query(ctx, `
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
		return nil, []string{}, []string{}, err
	}

	defer rows.Close()

	channelMessages := []*entities.ChannelMessage{}
	channelMessageIDs := []string{}
	authorIDs := []string{}

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
			return nil, []string{}, []string{}, err
		}

		channelMessages = append(channelMessages, channelMessage)
		channelMessageIDs = append(channelMessageIDs, channelMessage.ID)
		authorIDs = append(authorIDs, channelMessage.AuthorID)
	}

	return channelMessages, channelMessageIDs, authorIDs, nil
}
func (r *ChannelMessageRepository) Create(ctx context.Context, channelMessage *entities.ChannelMessage) error {
	_, err := r.db(ctx).Exec(ctx, `
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
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
	`,
		channelMessage.ID,
		channelMessage.Content,
		channelMessage.Pinned,
		channelMessage.Flag,
		channelMessage.AuthorID,
		channelMessage.ChannelID,
		channelMessage.GuildID,
		channelMessage.CreatedAt,
		channelMessage.UpdatedAt,
	)

	return err
}
func (r *ChannelMessageRepository) Update(ctx context.Context, channelMessage *entities.ChannelMessage) error {
	_, err := r.db(ctx).Exec(ctx, `
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
			id = $1;
	`,
		channelMessage.ID,
		channelMessage.Content,
		channelMessage.Pinned,
		channelMessage.Flag,
		channelMessage.AuthorID,
		channelMessage.ChannelID,
		channelMessage.GuildID,
		channelMessage.CreatedAt,
		channelMessage.UpdatedAt,
	)

	return err
}
func (r *ChannelMessageRepository) Delete(ctx context.Context, ID string) error {
	result, err := r.db(ctx).Exec(ctx, `
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

func (r *ChannelMessageRepository) AssociateAttachment(ctx context.Context, channelMessageID string, attachmentID string) error {
	result, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			channel_message_attachment(
				channel_message_id,
				attachment_id
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
func (r *ChannelMessageRepository) DisassociateAttachment(ctx context.Context, channelMessageID string, attachmentID string) error {
	result, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			channel_message_attachment
		WHERE
			attachment_id = $1
		AND
			channel_message_id = $2;
	`)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("rows affected is zero")
	}

	return nil
}
