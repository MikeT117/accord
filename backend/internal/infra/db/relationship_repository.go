package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
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
		return nil, err
	}

	return relationship, nil
}
func (r *RelationshipRepository) GetByUserID(ctx context.Context, userID string) ([]*entities.Relationship, error) {
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
			creator_id = $1
		OR
			recipient_id = $1;
	`, userID)

	if err != nil {
		return nil, err
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
			return nil, err
		}

		relationships = append(relationships, relationship)
	}

	return relationships, nil
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

	return err
}
func (r *RelationshipRepository) Update(ctx context.Context, relationship *entities.Relationship) error {
	_, err := r.db(ctx).Exec(ctx, `
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

	return err
}
func (r *RelationshipRepository) Delete(ctx context.Context, ID string) error {

	result, err := r.db(ctx).Exec(ctx, `
			DELETE FROM
				user_relationship
			WHERE
				id = $1;
		`, ID)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("zero rows affected")
	}

	return nil
}
