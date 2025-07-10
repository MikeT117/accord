package db

import (
	"context"
	"errors"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/jackc/pgx/v5"
)

type RelationshipRepository struct {
	db DBGetter
}

func CreateRelationshipRepository(db DBGetter) repositories.RelationshipRepository {
	return &RelationshipRepository{
		db: db,
	}
}

func (r *RelationshipRepository) GetByID(ctx context.Context, ID string) (*entities.Relationship, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			creator_id,
			recipient_id,
			status,
			created_at,
			updated_at
		FROM
			user_relationship
		WHERE
			id = $1;
	`, ID)

	relationship := &entities.Relationship{}
	if err := row.Scan(
		&relationship.ID,
		&relationship.CreatedAt,
		&relationship.RecipientID,
		&relationship.Status,
		&relationship.CreatedAt,
		&relationship.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select relationship by id failed", err)
	}

	return relationship, nil
}

func (r *RelationshipRepository) GetByUserID(ctx context.Context, userID string, status int8, before time.Time, limit int8) ([]*entities.Relationship, []string, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			creator_id,
			recipient_id,
			status,
			created_at,
			updated_at
		FROM
			user_relationship
		WHERE
			(
				status < 2
			AND
				(
					creator_id = $1
				OR
					recipient_id = $1
				)
			)
		OR
			creator_id = $1
		AND
			status = $2
		AND
			created_at < $3
		ORDER BY
			created_at ASC
		LIMIT $4;
	`, userID, status, before, limit)

	if err != nil {
		return nil, []string{}, wrapUnknownErr("select relationships by user id failed", err)
	}
	defer rows.Close()

	relationships := []*entities.Relationship{}
	userIDs := []string{}
	for rows.Next() {
		relationship := &entities.Relationship{}
		if err := rows.Scan(
			&relationship.ID,
			&relationship.CreatedAt,
			&relationship.RecipientID,
			&relationship.Status,
			&relationship.CreatedAt,
			&relationship.UpdatedAt,
		); err != nil {
			return nil, []string{}, wrapUnknownErr("map over select relationships by user id failed", err)
		}

		relationships = append(relationships, relationship)
		if userID != relationship.CreatorID {
			userIDs = append(userIDs, relationship.CreatorID)
		}
		if userID != relationship.RecipientID {
			userIDs = append(userIDs, relationship.RecipientID)
		}
	}

	return relationships, userIDs, nil
}

func (r *RelationshipRepository) GetByUserIDAndUserIDs(ctx context.Context, userID string, userIDs []string) ([]*entities.Relationship, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			creator_id,
			recipient_id,
			status,
			created_at,
			updated_at
		FROM
			user_relationship
		WHERE
			(
				creator_id = $1
			AND
				recipient_id = ANY($2)
			)
		OR (
				creator_id = ANY($2)
			AND
				recipient_id = $1
		);
	`, userID)

	if err != nil {
		return nil, wrapUnknownErr("select relationships by user id and user ids failed", err)
	}
	defer rows.Close()

	relationships := []*entities.Relationship{}
	for rows.Next() {
		relationship := &entities.Relationship{}
		if err := rows.Scan(
			&relationship.ID,
			&relationship.CreatedAt,
			&relationship.RecipientID,
			&relationship.Status,
			&relationship.CreatedAt,
			&relationship.UpdatedAt,
		); err != nil {
			return nil, wrapUnknownErr("map over select relationships by user id and user ids failed", err)
		}

		relationships = append(relationships, relationship)
	}

	return relationships, nil
}

func (r *RelationshipRepository) GetUserIDsByID(ctx context.Context, ID string) ([]string, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			creator_id,
			recipient_id,
		FROM
			user_relationship
		WHERE
			id = $1;
	`, ID)

	var CreatorID string
	var RecipientID string
	if err := row.Scan(
		&CreatorID,
		&RecipientID,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select relationship users by id failed", err)
	}

	return []string{CreatorID, RecipientID}, nil
}

func (r *RelationshipRepository) Create(ctx context.Context, relationship *entities.Relationship) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			user_relationship (
				id,
				creator_id,
				recipient_id,
				status,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6);
	`,
		relationship.ID,
		relationship.CreatorID,
		relationship.RecipientID,
		relationship.Status,
		relationship.CreatedAt,
		relationship.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("insert relationship failed", err)
	}

	return nil
}

func (r *RelationshipRepository) Update(ctx context.Context, relationship *entities.Relationship) error {
	result, err := r.db(ctx).Exec(ctx, `
	UPDATE
		user_relationship 
	SET
		status = $2,
		updated_at = $3,
	WHERE
		id =  $1;
`,
		relationship.ID,
		relationship.Status,
		relationship.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("update relationship failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return err
}

func (r *RelationshipRepository) Delete(ctx context.Context, ID string, creatorID string) error {
	result, err := r.db(ctx).Exec(ctx, `
			DELETE FROM
				user_relationship
			WHERE
				id = $1
			AND
				creator_id = $2;
		`, ID, creatorID)

	if err != nil {
		return wrapUnknownErr("delete relationship failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return err
}
