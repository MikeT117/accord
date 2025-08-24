package db

import (
	"context"
	"errors"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type ChannelMessageRepository struct {
	db DBGetter
}

func CreateChannelMessageRepository(db DBGetter) repositories.ChannelMessageRepository {
	return &ChannelMessageRepository{
		db: db,
	}
}

func (r *ChannelMessageRepository) GetByID(ctx context.Context, ID uuid.UUID) (*entities.ChannelMessage, error) {
	messageRow := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			content,
			pinned,
			flag,
			author_id,
			channel_id,
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
		&channelMessage.CreatedAt,
		&channelMessage.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select channel message by id failed", err)
	}

	return channelMessage, nil
}
func (r *ChannelMessageRepository) GetByAuthorID(ctx context.Context, authorID uuid.UUID, before time.Time, limit int) ([]*entities.ChannelMessage, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			content,
			pinned,
			flag,
			author_id,
			channel_id,
			created_at,
			updated_at
		FROM
			channel_message
		WHERE
			author_id = $1
		ORDER BY
			created_at ASC;
	`, authorID)

	if err != nil {
		return nil, wrapUnknownErr("select channel messages by author id failed", err)
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
			&channelMessage.CreatedAt,
			&channelMessage.UpdatedAt,
		); err != nil {
			return nil, wrapUnknownErr("map over select channel messages by author id failed", err)
		}

		channelMessages = append(channelMessages, channelMessage)
	}

	return channelMessages, nil
}
func (r *ChannelMessageRepository) GetByChannelID(ctx context.Context, channelID uuid.UUID, pinned bool, before time.Time, after time.Time, limit int) ([]*entities.ChannelMessage, []uuid.UUID, []uuid.UUID, error) {

	query := ``

	if pinned {
		query = `
			SELECT
				id,
				content,
				pinned,
				flag,
				author_id,
				channel_id,
				created_at,
				updated_at
			FROM
				channel_message
			WHERE
				channel_id = $1
			AND
				pinned
			AND
				created_at < $2
			AND
				created_at::timestamp(0) > $3
			ORDER BY
				created_at DESC
			LIMIT
				$4;
	`
	} else {
		query = `
			SELECT
				id,
				content,
				pinned,
				flag,
				author_id,
				channel_id,
				created_at,
				updated_at
			FROM
				channel_message
			WHERE
				channel_id = $1
			AND
				created_at < $2
			AND
				created_at::timestamp(0) > $3
			ORDER BY
				created_at DESC
			LIMIT
				$4;
	`
	}

	rows, err := r.db(ctx).Query(ctx, query, channelID, before, after, limit)
	if err != nil {
		return nil, nil, nil, wrapUnknownErr("select channel messages by channel id failed", err)
	}

	defer rows.Close()

	channelMessages := []*entities.ChannelMessage{}
	channelMessageIDs := []uuid.UUID{}
	authorIDs := []uuid.UUID{}

	for rows.Next() {
		channelMessage := &entities.ChannelMessage{}
		if err := rows.Scan(
			&channelMessage.ID,
			&channelMessage.Content,
			&channelMessage.Pinned,
			&channelMessage.Flag,
			&channelMessage.AuthorID,
			&channelMessage.ChannelID,
			&channelMessage.CreatedAt,
			&channelMessage.UpdatedAt,
		); err != nil {
			return nil, nil, nil, wrapUnknownErr("map over select channel messages by channel id failed", err)
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
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
	`,
		&channelMessage.ID,
		&channelMessage.Content,
		&channelMessage.Pinned,
		&channelMessage.Flag,
		&channelMessage.AuthorID,
		&channelMessage.ChannelID,
		&channelMessage.CreatedAt,
		&channelMessage.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("insert channel message failed", err)
	}

	return nil
}
func (r *ChannelMessageRepository) Update(ctx context.Context, channelMessage *entities.ChannelMessage) error {
	result, err := r.db(ctx).Exec(ctx, `
		UPDATE
			channel_message
		SET
			content = $2,
			pinned = $3,
			flag = $4,
			author_id = $5,
			channel_id = $6,
			created_at = $7,
			updated_at = $8
		WHERE
			id = $1;
	`,
		&channelMessage.ID,
		&channelMessage.Content,
		&channelMessage.Pinned,
		&channelMessage.Flag,
		&channelMessage.AuthorID,
		&channelMessage.ChannelID,
		&channelMessage.CreatedAt,
		&channelMessage.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("update channel message failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
func (r *ChannelMessageRepository) Delete(ctx context.Context, ID uuid.UUID) error {
	result, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			channel_message
		WHERE
			id = $1;
	`, ID)

	if err != nil {
		return wrapUnknownErr("delete channel message failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *ChannelMessageRepository) AssociateAttachment(ctx context.Context, channelMessageID uuid.UUID, attachmentID uuid.UUID) error {
	result, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			channel_message_attachment(
				channel_message_id,
				attachment_id
			)
		VALUES ($1, $2);
	`, channelMessageID, attachmentID)

	if err != nil {
		return wrapUnknownErr("insert channel message attachment association failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
func (r *ChannelMessageRepository) DisassociateAttachment(ctx context.Context, channelMessageID uuid.UUID, attachmentID uuid.UUID) error {
	result, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			channel_message_attachment
		WHERE
			attachment_id = $1
		AND
			channel_message_id = $2;
	`)

	if err != nil {
		return wrapUnknownErr("delete channel message attachment association failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
