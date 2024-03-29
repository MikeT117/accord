// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.23.0
// source: user_profile.sql

package sqlc

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const getUserIDByUsername = `-- name: GetUserIDByUsername :one
SELECT
id
FROM
users
WHERE
username = $1
`

func (q *Queries) GetUserIDByUsername(ctx context.Context, username string) (uuid.UUID, error) {
	row := q.db.QueryRow(ctx, getUserIDByUsername, username)
	var id uuid.UUID
	err := row.Scan(&id)
	return id, err
}

const getUserProfileByID = `-- name: GetUserProfileByID :one
WITH user_cte AS (
	SELECT
    u.id,
    u.display_name,
    u.username,
    u.public_flags,
    ua.attachment_id
    FROM
    users u 
    LEFT JOIN
    user_attachments ua ON ua.user_id = u.id
    WHERE
    u.id = $1
),

mutual_guilds_cte AS (
    SELECT
    ARRAY_AGG(gm.guild_id) AS mutual_guilds
    FROM
    guild_members gm
    WHERE
    gm.user_id = $2
    OR
    gm.user_id = $1
    GROUP BY
    gm.guild_id
)

SELECT
ucte.id, ucte.display_name, ucte.username, ucte.public_flags, ucte.attachment_id,
COALESCE(mgcte.mutual_guilds, '{}') AS mutual_guilds
FROM
user_cte ucte,
mutual_guilds_cte mgcte
`

type GetUserProfileByIDParams struct {
	UserID      uuid.UUID
	RequestorID uuid.UUID
}

type GetUserProfileByIDRow struct {
	ID           uuid.UUID
	DisplayName  string
	Username     string
	PublicFlags  int32
	AttachmentID pgtype.UUID
	MutualGuilds []uuid.UUID
}

func (q *Queries) GetUserProfileByID(ctx context.Context, arg GetUserProfileByIDParams) (GetUserProfileByIDRow, error) {
	row := q.db.QueryRow(ctx, getUserProfileByID, arg.UserID, arg.RequestorID)
	var i GetUserProfileByIDRow
	err := row.Scan(
		&i.ID,
		&i.DisplayName,
		&i.Username,
		&i.PublicFlags,
		&i.AttachmentID,
		&i.MutualGuilds,
	)
	return i, err
}

const getUserProfileByIDAndGuildID = `-- name: GetUserProfileByIDAndGuildID :one
WITH user_cte AS (
	SELECT
    u.id,
    (CASE
        WHEN gm.nickname IS NOT NULL THEN gm.nickname
        ELSE u.display_name
    END)::text AS display_name,
    u.username,
    u.public_flags,
    ua.attachment_id,
    gm.joined_at
    FROM
    users u
    INNER JOIN
    guild_members gm ON gm.user_id = u.id
    LEFT JOIN
    user_attachments ua ON ua.user_id = u.id
    WHERE
    u.id = $1
    AND
    gm.guild_id = $2
),

guild_member_roles_cte AS (
    SELECT
    ARRAY_AGG(gru.role_id) AS roles
    FROM
    guild_members gm
    INNER JOIN
    guild_role_users gru ON gru.user_id = gm.user_id
    WHERE
    gm.user_id = $1
    AND
    gm.guild_id = $2
),

mutual_guilds_cte AS (
    SELECT
    ARRAY_AGG(gm.guild_id) AS mutual_guilds
    FROM
    guild_members gm
    WHERE
    gm.user_id = $3
    OR
    gm.user_id = $1
    GROUP BY
    gm.guild_id
)

SELECT
ucte.id, ucte.display_name, ucte.username, ucte.public_flags, ucte.attachment_id, ucte.joined_at,
COALESCE(gmrcte.roles, '{}') AS roles,
COALESCE(mgcte.mutual_guilds, '{}') AS mutual_guilds
FROM
user_cte ucte,
guild_member_roles_cte gmrcte,
mutual_guilds_cte mgcte
`

type GetUserProfileByIDAndGuildIDParams struct {
	UserID      uuid.UUID
	GuildID     uuid.UUID
	RequestorID uuid.UUID
}

type GetUserProfileByIDAndGuildIDRow struct {
	ID           uuid.UUID
	DisplayName  string
	Username     string
	PublicFlags  int32
	AttachmentID pgtype.UUID
	JoinedAt     pgtype.Timestamp
	Roles        []uuid.UUID
	MutualGuilds []uuid.UUID
}

func (q *Queries) GetUserProfileByIDAndGuildID(ctx context.Context, arg GetUserProfileByIDAndGuildIDParams) (GetUserProfileByIDAndGuildIDRow, error) {
	row := q.db.QueryRow(ctx, getUserProfileByIDAndGuildID, arg.UserID, arg.GuildID, arg.RequestorID)
	var i GetUserProfileByIDAndGuildIDRow
	err := row.Scan(
		&i.ID,
		&i.DisplayName,
		&i.Username,
		&i.PublicFlags,
		&i.AttachmentID,
		&i.JoinedAt,
		&i.Roles,
		&i.MutualGuilds,
	)
	return i, err
}
