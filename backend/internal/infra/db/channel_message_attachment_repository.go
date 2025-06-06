package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type ChannelMessageAttachmentRepository struct {
	db DBTX
}

func CreateChannelMessageAttachmentRepository(db DBTX) repositories.ChannelMessageAttachmentRepository {
	return &ChannelMessageAttachmentRepository{
		db: db,
	}
}
func (r *ChannelMessageAttachmentRepository) Create(context context.Context, channelMessageID string, attachmentID string) error {
	result, err := r.db.Exec(context, `
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
func (r *ChannelMessageAttachmentRepository) Delete(context context.Context, channelMessageID string, attachmentID string) error {
	result, err := r.db.Exec(context, `
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
