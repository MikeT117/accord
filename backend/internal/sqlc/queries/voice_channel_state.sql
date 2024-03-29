
-- name: CreateVoiceChannelState :one
WITH delete_voice_channel_state AS (
    DELETE FROM
    voice_channel_states
    WHERE
    user_id = @user_id::uuid
),

insert_voice_channel_state AS (
    INSERT INTO
    voice_channel_states
    (channel_id, guild_id, user_id)
    SELECT
    c.id,
    c.guild_id,
    @user_id::uuid
    FROM
    channels c
    WHERE
    c.id = @channel_id::uuid
    RETURNING
    self_mute,
    self_deaf,
    channel_id,
    guild_id
)

SELECT
ivcscte.*,
u.id,
ua.attachment_id,
(   CASE 
        WHEN gm.nickname IS NOT NULL THEN gm.nickname
        ELSE u.display_name
    END
)::text AS display_name,
u.username,
u.public_flags
FROM
guild_members gm,
insert_voice_channel_state ivcscte
INNER JOIN
users u ON u.id = @user_id
LEFT JOIN
user_attachments ua ON ua.user_id = u.id;

-- name: UpdateVoiceChannelState :one
UPDATE
voice_channel_states
SET
self_mute = @self_mute,
self_deaf = @self_deaf
WHERE
user_id = @user_id
RETURNING
*;

-- name: DeleteVoiceChannelState :exec
DELETE FROM
voice_channel_states
WHERE
user_id = @user_id;