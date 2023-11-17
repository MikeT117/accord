// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.23.0
// source: user.sql

package sqlc

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const createOrGetUser = `-- name: CreateOrGetUser :one
INSERT INTO users (display_name, username, oauth_account_id)
VALUES ($1, $2, $3)
ON CONFLICT (oauth_account_id) DO UPDATE
SET display_name = users.display_name
RETURNING id, username, display_name, public_flags, relationship_count, oauth_account_id, created_at, updated_at
`

type CreateOrGetUserParams struct {
	DisplayName    string
	Username       string
	OauthAccountID uuid.UUID
}

func (q *Queries) CreateOrGetUser(ctx context.Context, arg CreateOrGetUserParams) (User, error) {
	row := q.db.QueryRow(ctx, createOrGetUser, arg.DisplayName, arg.Username, arg.OauthAccountID)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.DisplayName,
		&i.PublicFlags,
		&i.RelationshipCount,
		&i.OauthAccountID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getManyUsersByIDs = `-- name: GetManyUsersByIDs :many
SELECT u.id, u.username, u.display_name, u.public_flags, u.relationship_count, u.oauth_account_id, u.created_at, u.updated_at, ua.attachment_id
FROM users u
LEFT JOIN user_attachments ua ON ua.user_id = u.id
WHERE u.id = ANY ($1::uuid[])
`

type GetManyUsersByIDsRow struct {
	ID                uuid.UUID
	Username          string
	DisplayName       string
	PublicFlags       int32
	RelationshipCount int32
	OauthAccountID    uuid.UUID
	CreatedAt         pgtype.Timestamp
	UpdatedAt         pgtype.Timestamp
	AttachmentID      pgtype.UUID
}

func (q *Queries) GetManyUsersByIDs(ctx context.Context, userIds []uuid.UUID) ([]GetManyUsersByIDsRow, error) {
	rows, err := q.db.Query(ctx, getManyUsersByIDs, userIds)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []GetManyUsersByIDsRow{}
	for rows.Next() {
		var i GetManyUsersByIDsRow
		if err := rows.Scan(
			&i.ID,
			&i.Username,
			&i.DisplayName,
			&i.PublicFlags,
			&i.RelationshipCount,
			&i.OauthAccountID,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.AttachmentID,
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

const getUserByID = `-- name: GetUserByID :one
SELECT u.id, u.username, u.display_name, u.public_flags, u.relationship_count, u.oauth_account_id, u.created_at, u.updated_at, ua.attachment_id
FROM users u
LEFT JOIN user_attachments ua ON ua.user_id = u.id
WHERE u.id = $1
`

type GetUserByIDRow struct {
	ID                uuid.UUID
	Username          string
	DisplayName       string
	PublicFlags       int32
	RelationshipCount int32
	OauthAccountID    uuid.UUID
	CreatedAt         pgtype.Timestamp
	UpdatedAt         pgtype.Timestamp
	AttachmentID      pgtype.UUID
}

func (q *Queries) GetUserByID(ctx context.Context, userID uuid.UUID) (GetUserByIDRow, error) {
	row := q.db.QueryRow(ctx, getUserByID, userID)
	var i GetUserByIDRow
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.DisplayName,
		&i.PublicFlags,
		&i.RelationshipCount,
		&i.OauthAccountID,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.AttachmentID,
	)
	return i, err
}

const getUserByUsername = `-- name: GetUserByUsername :one
SELECT
u.id,
u.username,
u.display_name,
u.public_flags,
u.created_at
FROM
users u
WHERE
u.username = $1
`

type GetUserByUsernameRow struct {
	ID          uuid.UUID
	Username    string
	DisplayName string
	PublicFlags int32
	CreatedAt   pgtype.Timestamp
}

func (q *Queries) GetUserByUsername(ctx context.Context, username string) (GetUserByUsernameRow, error) {
	row := q.db.QueryRow(ctx, getUserByUsername, username)
	var i GetUserByUsernameRow
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.DisplayName,
		&i.PublicFlags,
		&i.CreatedAt,
	)
	return i, err
}

const updateUser = `-- name: UpdateUser :one
WITH updated_user_cte AS (
    UPDATE
    users
    SET
    display_name = $1,
    public_flags = $2
    WHERE
    id = $3
    RETURNING
    id,
    display_name,
    public_flags
)

SELECT
uucte.id, uucte.display_name, uucte.public_flags,
ua.attachment_id
FROM
updated_user_cte uucte
LEFT JOIN
user_attachments ua ON ua.user_id = uucte.id
`

type UpdateUserParams struct {
	DisplayName string
	PublicFlags int32
	UserID      uuid.UUID
}

type UpdateUserRow struct {
	ID           uuid.UUID
	DisplayName  string
	PublicFlags  int32
	AttachmentID pgtype.UUID
}

func (q *Queries) UpdateUser(ctx context.Context, arg UpdateUserParams) (UpdateUserRow, error) {
	row := q.db.QueryRow(ctx, updateUser, arg.DisplayName, arg.PublicFlags, arg.UserID)
	var i UpdateUserRow
	err := row.Scan(
		&i.ID,
		&i.DisplayName,
		&i.PublicFlags,
		&i.AttachmentID,
	)
	return i, err
}
