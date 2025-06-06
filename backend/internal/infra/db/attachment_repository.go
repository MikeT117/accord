package db

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type AttachmentRepository struct {
	db DBTX
}

func CreateAttachmentRepository(db DBTX) repositories.AttachmentRepository {
	return &AttachmentRepository{db: db}
}

func (r *AttachmentRepository) GetByID(context context.Context, ID string) (*entities.Attachment, error) {
	row := r.db.QueryRow(context, `
		SELECT
			id,
			resource_type,
			signature,
			unix_timestamp,
			owner_id,
			height,
			width,
			filesize,
			created_at,
			updated_at
		FROM
			attachment
		WHERE
			id = $1;
	`, ID)

	attachment := &entities.Attachment{}
	if err := row.Scan(
		&attachment.ID,
		&attachment.ResourceType,
		&attachment.Signature,
		&attachment.UnixTimestamp,
		&attachment.OwnerID,
		&attachment.Height,
		&attachment.Width,
		&attachment.FileSize,
		&attachment.CreatedAt,
		&attachment.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return attachment, nil
}

func (r *AttachmentRepository) GetByIDs(context context.Context, IDs []string) (map[string]*entities.Attachment, error) {
	attachmentsMap := make(map[string]*entities.Attachment)

	rows, err := r.db.Query(context, `
		SELECT
			id,
			resource_type,
			signature,
			unix_timestamp,
			owner_id,
			height,
			width,
			filesize,
			created_at,
			updated_at
		FROM
			entry_attachment
		WHERE
			id = ANY($1);
	`, IDs)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		attachment := &entities.Attachment{}
		if err := rows.Scan(
			&attachment.ID,
			&attachment.ResourceType,
			&attachment.Signature,
			&attachment.UnixTimestamp,
			&attachment.OwnerID,
			&attachment.Height,
			&attachment.Width,
			&attachment.FileSize,
			&attachment.CreatedAt,
			&attachment.UpdatedAt,
		); err != nil {
			return nil, err
		}

		attachmentsMap[attachment.ID] = attachment
	}

	return attachmentsMap, nil
}

func (r *AttachmentRepository) Create(context context.Context, validatedAttachment *entities.ValidatedAttachment) (*entities.Attachment, error) {
	row := r.db.QueryRow(context, `
		INSERT INTO
			entry_attachment (
				id,
				resource_type,
				signature,
				unix_timestamp,
				owner_id,
				height,
				width,
				filesize,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING
			id,
			resource_type,
			signature,
			unix_timestamp,
			owner_id,
			height,
			width,
			filesize,
			created_at,
			updated_at;
	`,
		validatedAttachment.ID,
		validatedAttachment.ResourceType,
		validatedAttachment.Signature,
		validatedAttachment.UnixTimestamp,
		validatedAttachment.OwnerID,
		validatedAttachment.Height,
		validatedAttachment.Width,
		validatedAttachment.FileSize,
		validatedAttachment.CreatedAt,
		validatedAttachment.UpdatedAt,
	)

	attachment := &entities.Attachment{}

	if err := row.Scan(
		&attachment.ID,
		&attachment.ResourceType,
		&attachment.Signature,
		&attachment.UnixTimestamp,
		&attachment.OwnerID,
		&attachment.Height,
		&attachment.Width,
		&attachment.FileSize,
		&attachment.CreatedAt,
		&attachment.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return attachment, nil

}
