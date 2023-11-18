-- name: CreateVoiceChannelState :one
WITH delete_voice_channel_state AS (
    DELETE FROM
    voice_channel_states
    WHERE
    user_id = @user_id::uuid
),

insert_voice_channel_state AS (
    INSERT INTO
    voice_channel_states (channel_id, guild_id, user_id)
    SELECT
    c.id,
    c.guild_id,
    @user_id::uuid
    FROM
    channels c
    WHERE
    c.id = @channel_id::uuid
    RETURNING *
)

SELECT * from insert_voice_channel_state;

-- name: UpdateVoiceChannelState :one
UPDATE voice_channel_states
SET
self_mute = @self_mute,
self_deaf = @self_deaf
WHERE
user_id = @user_id
RETURNING *;

-- name: DeleteVoiceChannelState :exec
DELETE FROM
voice_channel_states
WHERE
user_id = @user_id;
