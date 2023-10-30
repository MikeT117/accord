// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.23.0
// source: user_relationship.sql

package sqlc

import (
	"context"

	"github.com/google/uuid"
)

const createRelationship = `-- name: CreateRelationship :one
INSERT INTO relationships (status, creator_id)
VALUES (1, $1)
RETURNING id, creator_id, status, created_at, updated_at
`

func (q *Queries) CreateRelationship(ctx context.Context, creatorID uuid.UUID) (Relationship, error) {
	row := q.db.QueryRow(ctx, createRelationship, creatorID)
	var i Relationship
	err := row.Scan(
		&i.ID,
		&i.CreatorID,
		&i.Status,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const deleteRelationship = `-- name: DeleteRelationship :exec
DELETE
FROM relationships
WHERE id = $1
`

func (q *Queries) DeleteRelationship(ctx context.Context, relationshipID uuid.UUID) error {
	_, err := q.db.Exec(ctx, deleteRelationship, relationshipID)
	return err
}

const getRelationshipUsersByRelationshipID = `-- name: GetRelationshipUsersByRelationshipID :many
SELECT u.id, u.display_name, u.username, u.public_flags
FROM relationship_users ru
INNER JOIN users u ON u.id = ru.user_id
WHERE relationship_id = $1
`

type GetRelationshipUsersByRelationshipIDRow struct {
	ID          uuid.UUID
	DisplayName string
	Username    string
	PublicFlags int32
}

func (q *Queries) GetRelationshipUsersByRelationshipID(ctx context.Context, relationshipID uuid.UUID) ([]GetRelationshipUsersByRelationshipIDRow, error) {
	rows, err := q.db.Query(ctx, getRelationshipUsersByRelationshipID, relationshipID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []GetRelationshipUsersByRelationshipIDRow{}
	for rows.Next() {
		var i GetRelationshipUsersByRelationshipIDRow
		if err := rows.Scan(
			&i.ID,
			&i.DisplayName,
			&i.Username,
			&i.PublicFlags,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const linkRelationshipUsers = `-- name: LinkRelationshipUsers :many
WITH users_cte AS (
    SELECT u.id, u.display_name, u.username, u.public_flags, ua.attachment_id
    FROM users u
    INNER JOIN user_attachments ua ON ua.user_id = u.id
    WHERE u.id = ANY($1::uuid[])
),

insert_relationship_users_cte AS (
    INSERT INTO relationship_users (relationship_id, user_id)
    SELECT $2, id
    FROM users_cte
    RETURNING relationship_id, user_id
)

SELECT 
FROM
users_cte
`

type LinkRelationshipUsersParams struct {
	UserIds        []uuid.UUID
	RelationshipID uuid.UUID
}

type LinkRelationshipUsersRow struct {
}

func (q *Queries) LinkRelationshipUsers(ctx context.Context, arg LinkRelationshipUsersParams) ([]LinkRelationshipUsersRow, error) {
	rows, err := q.db.Query(ctx, linkRelationshipUsers, arg.UserIds, arg.RelationshipID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []LinkRelationshipUsersRow{}
	for rows.Next() {
		var i LinkRelationshipUsersRow
		if err := rows.Scan(); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateRelationship = `-- name: UpdateRelationship :one
UPDATE relationships
SET status = $1
WHERE id = $2
RETURNING id, creator_id, status, created_at, updated_at
`

type UpdateRelationshipParams struct {
	Status         int32
	RelationshipID uuid.UUID
}

func (q *Queries) UpdateRelationship(ctx context.Context, arg UpdateRelationshipParams) (Relationship, error) {
	row := q.db.QueryRow(ctx, updateRelationship, arg.Status, arg.RelationshipID)
	var i Relationship
	err := row.Scan(
		&i.ID,
		&i.CreatorID,
		&i.Status,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
