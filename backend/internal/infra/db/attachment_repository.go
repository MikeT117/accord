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

type AttachmentRepository struct {
	db DBGetter
}

func CreateAttachmentRepository(db DBGetter) repositories.AttachmentRepository {
	return &AttachmentRepository{db: db}
}

func (r *AttachmentRepository) GetByID(ctx context.Context, ID uuid.UUID) (*entities.Attachment, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			filename,
			resource_type,
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
		&attachment.Filename,
		&attachment.ResourceType,
		&attachment.OwnerID,
		&attachment.Height,
		&attachment.Width,
		&attachment.Filesize,
		&attachment.CreatedAt,
		&attachment.UpdatedAt,
		&attachment.Status,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select attachment by id failed", err)
	}

	return attachment, nil
}

func (r *AttachmentRepository) GetMapByIDs(ctx context.Context, IDs []uuid.UUID) (map[uuid.UUID]*entities.Attachment, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			filename,
			resource_type,
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
			id = ANY($1);
	`, IDs)

	if err != nil {
		return nil, wrapUnknownErr("select attachment by ids failed", err)
	}

	defer rows.Close()

	attachmentsMap := make(map[uuid.UUID]*entities.Attachment)
	for rows.Next() {
		attachment := &entities.Attachment{}
		if err := rows.Scan(
			&attachment.ID,
			&attachment.Filename,
			&attachment.ResourceType,
			&attachment.Height,
			&attachment.Width,
			&attachment.OwnerID,
			&attachment.Filesize,
			&attachment.CreatedAt,
			&attachment.UpdatedAt,
			&attachment.Status,
		); err != nil {
			return nil, wrapUnknownErr("map over select attachment by ids failed", err)
		}

		attachmentsMap[attachment.ID] = attachment
	}

	return attachmentsMap, nil
}

func (r *AttachmentRepository) GetByIDs(ctx context.Context, IDs []uuid.UUID) ([]*entities.Attachment, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			filename,
			resource_type,
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
			id = ANY($1);
	`, IDs)

	if err != nil {
		return nil, wrapUnknownErr("select attachment by ids failed", err)
	}

	defer rows.Close()

	attachments := []*entities.Attachment{}
	for rows.Next() {
		attachment := &entities.Attachment{}
		if err := rows.Scan(
			&attachment.ID,
			&attachment.Filename,
			&attachment.ResourceType,
			&attachment.OwnerID,
			&attachment.Height,
			&attachment.Width,
			&attachment.Filesize,
			&attachment.CreatedAt,
			&attachment.UpdatedAt,
			&attachment.Status,
		); err != nil {
			return nil, wrapUnknownErr("map over select attachment by ids failed", err)
		}

		attachments = append(attachments, attachment)
	}

	return attachments, nil
}

func (r *AttachmentRepository) GetByAssociatedChannelMessageID(ctx context.Context, ID uuid.UUID) ([]*entities.Attachment, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			a.id,
			a.filename,
			a.resource_type,
			a.owner_id,
			a.height,
			a.width,
			a.filesize,
			a.created_at,
			a.updated_at,
			a.status
		FROM
			attachment a
		INNER JOIN
			channel_message_attachment cma ON cma.attachment_id = a.id
		WHERE
			cma.channel_message_id = $1;
	`, ID)

	if err != nil {
		return nil, wrapUnknownErr("select attachments by associated channel message ID failed", err)
	}

	defer rows.Close()

	attachments := []*entities.Attachment{}
	for rows.Next() {
		attachment := &entities.Attachment{}
		if err := rows.Scan(
			&attachment.ID,
			&attachment.Filename,
			&attachment.ResourceType,
			&attachment.OwnerID,
			&attachment.Height,
			&attachment.Width,
			&attachment.Filesize,
			&attachment.CreatedAt,
			&attachment.UpdatedAt,
			&attachment.Status,
		); err != nil {
			return nil, wrapUnknownErr("map over select attachments by associated channel message ID failed", err)
		}

		attachments = append(attachments, attachment)
	}

	return attachments, nil
}

func (r *AttachmentRepository) GetMapByAssociatedChannelMessageIDs(ctx context.Context, IDs []uuid.UUID) (map[uuid.UUID][]*entities.Attachment, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			cma.channel_message_id,
			a.id,
			a.filename,
			a.resource_type,
			a.owner_id,
			a.height,
			a.width,
			a.filesize,
			a.created_at,
			a.updated_at,
			a.status
		FROM
			attachment a
		INNER JOIN
			channel_message_attachment cma ON cma.attachment_id = a.id
		WHERE
			cma.channel_message_id = any($1);
	`, IDs)

	if err != nil {
		return nil, wrapUnknownErr("select attachments by associated channel message IDs failed", err)
	}

	defer rows.Close()

	attachmentsMap := make(map[uuid.UUID][]*entities.Attachment)
	for rows.Next() {
		attachment := &entities.Attachment{}
		var channelMessageID uuid.UUID
		if err := rows.Scan(
			&channelMessageID,
			&attachment.ID,
			&attachment.Filename,
			&attachment.ResourceType,
			&attachment.OwnerID,
			&attachment.Height,
			&attachment.Width,
			&attachment.Filesize,
			&attachment.CreatedAt,
			&attachment.UpdatedAt,
			&attachment.Status,
		); err != nil {
			return nil, wrapUnknownErr("map over select attachments by associated channel message IDs failed", err)
		}

		attachmentsMap[channelMessageID] = append(attachmentsMap[channelMessageID], attachment)
	}

	return attachmentsMap, nil
}

func (r *AttachmentRepository) Create(ctx context.Context, attachment *entities.Attachment) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			attachment (
				id,
				filename,
				resource_type,
				owner_id,
				height,
				width,
				filesize,
				created_at,
				updated_at,
				status
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
	`,
		&attachment.ID,
		&attachment.Filename,
		&attachment.ResourceType,
		&attachment.OwnerID,
		attachment.Height,
		attachment.Width,
		&attachment.Filesize,
		&attachment.CreatedAt,
		&attachment.UpdatedAt,
		&attachment.Status,
	)
	if err != nil {
		return wrapUnknownErr("insert attachment failed", err)
	}

	return nil
}

func (r *AttachmentRepository) Update(ctx context.Context, attachment *entities.Attachment) error {
	result, err := r.db(ctx).Exec(ctx, `
		UPDATE
			attachment
		SET
			filename = $2,
			resource_type = $3,
			owner_id = $4,
			height = $5,
			width = $6,
			filesize = $7,
			created_at = $8,
			updated_at = $9,
			status = $10
		WHERE
			id = $1;
	`,
		&attachment.ID,
		&attachment.Filename,
		&attachment.ResourceType,
		&attachment.OwnerID,
		attachment.Height,
		attachment.Width,
		&attachment.Filesize,
		&attachment.CreatedAt,
		&attachment.UpdatedAt,
		&attachment.Status,
	)

	if err != nil {
		return wrapUnknownErr("update attachment failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *AttachmentRepository) Delete(ctx context.Context, ID uuid.UUID, userID uuid.UUID) error {
	result, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			attachment
		WHERE
			id = $1
		AND
			owner_id = $2;
	`, ID, userID)

	if err != nil {
		return wrapUnknownErr("delete attachment failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
