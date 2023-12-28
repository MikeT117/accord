// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.23.0
// source: guild_invites.sql

package sqlc

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const createGuildInvite = `-- name: CreateGuildInvite :one
INSERT INTO
guild_invites
(user_id, guild_id)
SELECT
gm.user_id,
gm.guild_id
FROM
guild_members gm
WHERE
gm.user_id = $1
AND
gm.guild_id = $2
RETURNING
id
`

type CreateGuildInviteParams struct {
	UserID  uuid.UUID
	GuildID uuid.UUID
}

func (q *Queries) CreateGuildInvite(ctx context.Context, arg CreateGuildInviteParams) (uuid.UUID, error) {
	row := q.db.QueryRow(ctx, createGuildInvite, arg.UserID, arg.GuildID)
	var id uuid.UUID
	err := row.Scan(&id)
	return id, err
}

const deleteGuildInvite = `-- name: DeleteGuildInvite :execrows
DELETE 
FROM guild_invites
WHERE id = $1
AND
guild_id = $2
`

type DeleteGuildInviteParams struct {
	GuildInviteID uuid.UUID
	GuildID       uuid.UUID
}

func (q *Queries) DeleteGuildInvite(ctx context.Context, arg DeleteGuildInviteParams) (int64, error) {
	result, err := q.db.Exec(ctx, deleteGuildInvite, arg.GuildInviteID, arg.GuildID)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected(), nil
}

const getGuildInviteByID = `-- name: GetGuildInviteByID :one
WITH guild_guild_invite_cte AS (
    SELECT
    gi.id,
    gi.guild_id,
    gi.flags,
    g.name,
    g.description,
    g.member_count
    FROM
    guild_invites gi
    INNER JOIN
    guilds g ON g.id = gi.guild_id
    WHERE
    gi.id = $1
),

icon_cte AS (
  SELECT
  attachment_id,
  guild_id
  FROM
  guild_attachments ga
  WHERE
  guild_id IN (
    SELECT
    guild_id
    FROM
    guild_guild_invite_cte
  )
  AND
  usage_type = 0
),

banner_cte AS (
  SELECT
  attachment_id,
  guild_id
  FROM
  guild_attachments ga
  WHERE
  guild_id IN (
    SELECT
    guild_id
    FROM
    guild_guild_invite_cte
  ) AND
  usage_type = 1
)

SELECT
ggicte.id, ggicte.guild_id, ggicte.flags, ggicte.name, ggicte.description, ggicte.member_count,
icte.attachment_id AS icon,
bcte.attachment_id AS banner
FROM
guild_guild_invite_cte ggicte
LEFT JOIN
icon_cte icte ON icte IS NOT NULL
LEFT JOIN
banner_cte bcte ON bcte IS NOT NULL
`

type GetGuildInviteByIDRow struct {
	ID          uuid.UUID
	GuildID     uuid.UUID
	Flags       int16
	Name        string
	Description string
	MemberCount int32
	Icon        pgtype.UUID
	Banner      pgtype.UUID
}

func (q *Queries) GetGuildInviteByID(ctx context.Context, inviteID uuid.UUID) (GetGuildInviteByIDRow, error) {
	row := q.db.QueryRow(ctx, getGuildInviteByID, inviteID)
	var i GetGuildInviteByIDRow
	err := row.Scan(
		&i.ID,
		&i.GuildID,
		&i.Flags,
		&i.Name,
		&i.Description,
		&i.MemberCount,
		&i.Icon,
		&i.Banner,
	)
	return i, err
}

const getManyGuildInvitesByGuildID = `-- name: GetManyGuildInvitesByGuildID :many
SELECT
gi.id,
gi.flags,
gi.used_count,
gi.updated_at,
gi.user_id,
CASE
    WHEN gm.nickname IS NOT NULL THEN gm.nickname
    ELSE u.display_name
END::text AS display_name,
u.username,
u.public_flags,
ua.attachment_id
FROM
guild_invites gi
INNER JOIN
guild_members gm ON gm.user_id = gi.user_id
AND
gm.guild_id = gi.guild_id
INNER JOIN
users u ON u.id = gi.user_id
LEFT JOIN
user_attachments ua ON ua.user_id = gi.user_id
WHERE
gi.guild_id = $1
AND
    (CASE
        WHEN $2::uuid IS NOT NULL THEN gi.id < $2::uuid
        ELSE TRUE
    END)
    AND 
    (CASE
        WHEN $3::uuid IS NOT NULL THEN gi.id > $3::uuid
        ELSE TRUE
    END)
ORDER BY
gi.id DESC
LIMIT $4
`

type GetManyGuildInvitesByGuildIDParams struct {
	GuildID      uuid.UUID
	Before       pgtype.UUID
	After        pgtype.UUID
	ResultsLimit int64
}

type GetManyGuildInvitesByGuildIDRow struct {
	ID           uuid.UUID
	Flags        int16
	UsedCount    int32
	UpdatedAt    pgtype.Timestamp
	UserID       uuid.UUID
	DisplayName  string
	Username     string
	PublicFlags  int32
	AttachmentID pgtype.UUID
}

func (q *Queries) GetManyGuildInvitesByGuildID(ctx context.Context, arg GetManyGuildInvitesByGuildIDParams) ([]GetManyGuildInvitesByGuildIDRow, error) {
	rows, err := q.db.Query(ctx, getManyGuildInvitesByGuildID,
		arg.GuildID,
		arg.Before,
		arg.After,
		arg.ResultsLimit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []GetManyGuildInvitesByGuildIDRow{}
	for rows.Next() {
		var i GetManyGuildInvitesByGuildIDRow
		if err := rows.Scan(
			&i.ID,
			&i.Flags,
			&i.UsedCount,
			&i.UpdatedAt,
			&i.UserID,
			&i.DisplayName,
			&i.Username,
			&i.PublicFlags,
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
