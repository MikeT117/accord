// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.23.0
// source: voice_channel_state.sql

package sqlc

import (
	"context"

	"github.com/google/uuid"
)

const createVoiceChannelState = `-- name: CreateVoiceChannelState :one
WITH delete_voice_channel_state AS (
    DELETE FROM
    voice_channel_states
    WHERE
    user_id = $1::uuid
),

insert_voice_channel_state AS (
    INSERT INTO
    voice_channel_states (channel_id, guild_id, user_id)
    SELECT
    c.id,
    c.guild_id,
    $1::uuid
    FROM
    channels c
    WHERE
    c.id = $2::uuid
    RETURNING mute, self_mute, self_deaf, channel_id, user_id, guild_id
)

SELECT mute, self_mute, self_deaf, channel_id, user_id, guild_id from insert_voice_channel_state
`

type CreateVoiceChannelStateParams struct {
	UserID    uuid.UUID
	ChannelID uuid.UUID
}

type CreateVoiceChannelStateRow struct {
	Mute      bool
	SelfMute  bool
	SelfDeaf  bool
	ChannelID uuid.UUID
	UserID    uuid.UUID
	GuildID   uuid.UUID
}

func (q *Queries) CreateVoiceChannelState(ctx context.Context, arg CreateVoiceChannelStateParams) (CreateVoiceChannelStateRow, error) {
	row := q.db.QueryRow(ctx, createVoiceChannelState, arg.UserID, arg.ChannelID)
	var i CreateVoiceChannelStateRow
	err := row.Scan(
		&i.Mute,
		&i.SelfMute,
		&i.SelfDeaf,
		&i.ChannelID,
		&i.UserID,
		&i.GuildID,
	)
	return i, err
}

const deleteVoiceChannelState = `-- name: DeleteVoiceChannelState :exec
DELETE FROM
voice_channel_states
WHERE
user_id = $1
`

func (q *Queries) DeleteVoiceChannelState(ctx context.Context, userID uuid.UUID) error {
	_, err := q.db.Exec(ctx, deleteVoiceChannelState, userID)
	return err
}

const updateVoiceChannelState = `-- name: UpdateVoiceChannelState :one
UPDATE voice_channel_states
SET
self_mute = $1,
self_deaf = $2
WHERE
user_id = $3
RETURNING mute, self_mute, self_deaf, channel_id, user_id, guild_id
`

type UpdateVoiceChannelStateParams struct {
	SelfMute bool
	SelfDeaf bool
	UserID   uuid.UUID
}

func (q *Queries) UpdateVoiceChannelState(ctx context.Context, arg UpdateVoiceChannelStateParams) (VoiceChannelState, error) {
	row := q.db.QueryRow(ctx, updateVoiceChannelState, arg.SelfMute, arg.SelfDeaf, arg.UserID)
	var i VoiceChannelState
	err := row.Scan(
		&i.Mute,
		&i.SelfMute,
		&i.SelfDeaf,
		&i.ChannelID,
		&i.UserID,
		&i.GuildID,
	)
	return i, err
}