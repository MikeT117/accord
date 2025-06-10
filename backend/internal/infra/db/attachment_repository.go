package db

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type AttachmentRepository struct {
	db DBGetter
}

func CreateAttachmentRepository(db DBGetter) repositories.AttachmentRepository {
	return &AttachmentRepository{db: db}
}

func (r *AttachmentRepository) GetByID(ctx context.Context, ID string) (*entities.Attachment, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			resource_type,
			signature,
			owner_id,
			height,
			width,
			filesize,
			created_at,
			updated_at,
			status
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
		&attachment.OwnerID,
		&attachment.Height,
		&attachment.Width,
		&attachment.Filesize,
		&attachment.CreatedAt,
		&attachment.UpdatedAt,
		&attachment.Status,
	); err != nil {
		return nil, err
	}

	return attachment, nil
}

func (r *AttachmentRepository) GetByIDs(ctx context.Context, IDs []string) (map[string]*entities.Attachment, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			resource_type,
			signature,
			owner_id,
			height,
			width,
			filesize,
			created_at,
			updated_at,
			status
		FROM
			entry_attachment
		WHERE
			id = ANY($1);
	`, IDs)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	attachmentsMap := make(map[string]*entities.Attachment)
	for rows.Next() {
		attachment := &entities.Attachment{}
		if err := rows.Scan(
			&attachment.ID,
			&attachment.ResourceType,
			&attachment.Signature,
			&attachment.OwnerID,
			&attachment.Height,
			&attachment.Width,
			&attachment.Filesize,
			&attachment.CreatedAt,
			&attachment.UpdatedAt,
			&attachment.Status,
		); err != nil {
			return nil, err
		}

		attachmentsMap[attachment.ID] = attachment
	}

	return attachmentsMap, nil
}

func (r *AttachmentRepository) GetByAssociatedChannelMessageID(ctx context.Context, ID string) ([]*entities.Attachment, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			ea.id,
			ea.resource_type,
			ea.signature,
			ea.owner_id,
			ea.height,
			ea.width,
			ea.filesize,
			ea.created_at,
			ea.updated_at,
			ea.status
		FROM
			entry_attachment ea
		INNER JOIN
			channel_message_attachment cma ON cma.attachment_id = ea.id
		WHERE
			cma.channel_message_id = $1;
	`, ID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	attachments := []*entities.Attachment{}
	for rows.Next() {
		attachment := &entities.Attachment{}
		if err := rows.Scan(
			&attachment.ID,
			&attachment.ResourceType,
			&attachment.Signature,
			&attachment.OwnerID,
			&attachment.Height,
			&attachment.Width,
			&attachment.Filesize,
			&attachment.CreatedAt,
			&attachment.UpdatedAt,
			&attachment.Status,
		); err != nil {
			return nil, err
		}

		attachments = append(attachments, attachment)
	}

	return attachments, nil
}

func (r *AttachmentRepository) GetByAssociatedChannelMessageIDs(ctx context.Context, IDs []string) (map[string][]*entities.Attachment, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			cma.channel_message_id,
			ea.id,
			ea.resource_type,
			ea.signature,
			ea.owner_id,
			ea.height,
			ea.width,
			ea.filesize,
			ea.created_at,
			ea.updated_at,
			ea.status
		FROM
			entry_attachment ea
		INNER JOIN
			channel_message_attachment cma ON cma.attachment_id = ea.id
		WHERE
			cma.channel_message_id = any($1);
	`, IDs)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	attachmentsMap := make(map[string][]*entities.Attachment)
	for rows.Next() {
		attachment := &entities.Attachment{}
		var channelMessageID string
		if err := rows.Scan(
			&channelMessageID,
			&attachment.ID,
			&attachment.ResourceType,
			&attachment.Signature,
			&attachment.OwnerID,
			&attachment.Height,
			&attachment.Width,
			&attachment.Filesize,
			&attachment.CreatedAt,
			&attachment.UpdatedAt,
			&attachment.Status,
		); err != nil {
			return nil, err
		}

		attachmentsMap[channelMessageID] = append(attachmentsMap[channelMessageID], attachment)
	}

	return attachmentsMap, nil
}

func (r *AttachmentRepository) Create(ctx context.Context, attachment *entities.Attachment) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			entry_attachment (
				id,
				resource_type,
				signature,
				owner_id,
				height,
				width,
				filesize,
				created_at,
				updated_at,
				status,
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
	`,
		attachment.ID,
		attachment.ResourceType,
		attachment.Signature,
		attachment.OwnerID,
		attachment.Height,
		attachment.Width,
		attachment.Filesize,
		attachment.CreatedAt,
		attachment.UpdatedAt,
		attachment.Status,
	)

	return err
}

func (r *AttachmentRepository) Update(ctx context.Context, attachment *entities.Attachment) error {
	_, err := r.db(ctx).Exec(ctx, `
		UPDATE
			entry_attachment
		SET
			id = $1,
			resource_type = $1,
			signature = $1,
			owner_id = $1,
			height = $1,
			width = $1,
			filesize = $1,
			created_at = $1,
			updated_at = $1
		WHERE
			id = $1;
	`,
		attachment.ID,
		attachment.ResourceType,
		attachment.Signature,
		attachment.OwnerID,
		attachment.Height,
		attachment.Width,
		attachment.Filesize,
		attachment.CreatedAt,
		attachment.UpdatedAt,
		attachment.Status,
	)

	return err
}

func (r *AttachmentRepository) Delete(ctx context.Context, ID string) error {
	_, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			entry_attachment
		WHERE
			id = $1;
	`, ID)

	return err
}
