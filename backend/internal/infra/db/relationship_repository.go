package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type RelationshipRepository struct {
	db DBTX
}

func CreateRelationshipRepository(db DBTX) repositories.RelationshipRepository {
	return &RelationshipRepository{
		db: db,
	}
}

func (r *RelationshipRepository) GetByID(context context.Context, ID string) (*entities.Relationship, error) {
	row := r.db.QueryRow(context, `
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
func (r *RelationshipRepository) GetByUserID(context context.Context, userID string) ([]*entities.Relationship, error) {
	rows, err := r.db.Query(context, `
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
func (r *RelationshipRepository) Create(context context.Context, validatedRelationship *entities.ValidatedRelationship) (*entities.Relationship, error) {
	row := r.db.QueryRow(context, `
		INSERT INTO
			user_relationship (
				id,
				creator_id,
				recipient_id,
				status,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING
				id,
				creator_id,
				recipient_id,
				status,
				created_at,
				updated_at
	`,
		validatedRelationship.ID,
		validatedRelationship.CreatorID,
		validatedRelationship.RecipientID,
		validatedRelationship.Status,
		validatedRelationship.CreatedAt,
		validatedRelationship.UpdatedAt,
	)

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
func (r *RelationshipRepository) Update(context context.Context, validatedRelationship *entities.ValidatedRelationship) (*entities.Relationship, error) {
	row := r.db.QueryRow(context, `
	UPDATE
		user_relationship 
	SET
		status = $2,
		updated_at = $3,
	WHERE
		id =  $1
	RETURNING
		id,
		creator_id,
		recipient_id,
		status,
		created_at,
		updated_at;
`,
		validatedRelationship.ID,
		validatedRelationship.Status,
		validatedRelationship.UpdatedAt,
	)

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
func (r *RelationshipRepository) Delete(context context.Context, ID string) error {

	result, err := r.db.Exec(context, `
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
