-- name: GetManyChannelMessagesByChannelID :many
WITH channel_messages_cte AS (
    SELECT
    cm.id,
    cm.user_id,
    cm.channel_id,
    cm.content,
    cm.is_pinned,
    cm.flags,
    cm.created_at,
    cm.updated_at,
    CASE
        WHEN gm.nickname IS NOT NULL THEN gm.nickname
        ELSE u.display_name
    END::text AS display_name,
    u.username,
    u.public_flags,
    ua.attachment_id
    FROM
    channel_messages cm
    INNER JOIN
    users u ON u.id = cm.user_id
    LEFT JOIN
    user_attachments ua ON ua.user_id = u.id
    LEFT JOIN
    guild_members gm ON gm.guild_id = cm.guild_id AND cm.user_id = gm.user_id
    WHERE
    cm.channel_id = @channel_id
    AND
    (CASE
        WHEN sqlc.narg(before)::uuid IS NOT NULL THEN cm.id < sqlc.narg(before)::uuid
        ELSE TRUE
    END)
    AND 
    (CASE
        WHEN sqlc.narg(after)::uuid IS NOT NULL THEN cm.id > sqlc.narg(after)::uuid
        ELSE TRUE
    END)
    AND
    (CASE
        WHEN sqlc.narg(pinned)::boolean IS NOT NULL THEN cm.is_pinned = sqlc.narg(pinned)::boolean
        ELSE TRUE
    END)
    ORDER BY
    CASE
		WHEN sqlc.narg(after)::uuid IS NOT NULL THEN cm.id
	END ASC,
	CASE
        WHEN sqlc.narg(after)::uuid IS NULL THEN cm.id
	END DESC
    LIMIT @results_limit
),

attachments_cte AS (
    SELECT
    cma.channel_message_id,
    ARRAY_AGG(cma.attachment_id)::text[] AS attachments
    FROM
    channel_message_attachments cma
    INNER JOIN
    channel_messages_cte cmcte ON cmcte.id = cma.channel_message_id
    GROUP BY
    cma.channel_message_id
)

SELECT
cmcte.*,
COALESCE(acte.attachments, '{}')
FROM
channel_messages_cte cmcte
LEFT JOIN
attachments_cte acte ON acte.channel_message_id = cmcte.id
ORDER BY
cmcte.id DESC;

-- name: CreateChannelMessage :one
WITH channel_message_insert_cte AS (
    INSERT INTO
    channel_messages (content, user_id, channel_id, guild_id)
    SELECT
    @content,
    @user_id,
    c.id,
    c.guild_id
    FROM
    channels c
    WHERE
    c.id = @channel_id
    RETURNING *
),

channel_messages_cte AS (
    SELECT
    cmicte.id,
    cmicte.user_id,
    cmicte.channel_id,
    cmicte.content,
    cmicte.is_pinned,
    cmicte.flags,
    cmicte.created_at,
    cmicte.updated_at,
    CASE
        WHEN gm.nickname IS NOT NULL THEN gm.nickname
        ELSE u.display_name
    END::text AS display_name,
    u.username,
    u.public_flags,
    ua.attachment_id
    FROM
    channel_message_insert_cte cmicte
    INNER JOIN
    users u ON u.id = cmicte.user_id
    LEFT JOIN
    user_attachments ua ON ua.user_id = u.id
    LEFT JOIN
    guild_members gm ON gm.guild_id = cmicte.guild_id
    AND
    cmicte.user_id = gm.user_id
),

attachments_cte AS (
    SELECT
    cma.channel_message_id,
    ARRAY_AGG(cma.attachment_id)::text[] AS attachments
    FROM
    channel_message_attachments cma
    INNER JOIN
    channel_messages_cte cmcte ON cmcte.id = cma.channel_message_id
    GROUP BY
    cma.channel_message_id
)

SELECT
cmcte.*,
COALESCE(acte.attachments, '{}')
FROM
channel_messages_cte cmcte
LEFT JOIN
attachments_cte acte ON acte.channel_message_id = cmcte.id;


-- name: UpdateChannelMessage :one
UPDATE
channel_messages
SET
content = @content,
updated_at = NOW()
WHERE
id = @message_id
AND
channel_id = @channel_id
RETURNING
id,
channel_id,
content,
is_pinned,
updated_at;

-- name: PinChannelMessage :execrows
UPDATE
channel_messages
SET
is_pinned = true
WHERE
id = @message_id
AND
channel_id = @channel_id
RETURNING
id,
channel_id,
content,
is_pinned;

-- name: UnpinChannelMessage :execrows
UPDATE
channel_messages
SET
is_pinned = false
WHERE
id = @message_id
AND
channel_id = @channel_id
RETURNING
id,
channel_id,
content,
is_pinned;

-- name: DeleteChannelMessage :one
DELETE FROM
channel_messages
WHERE
id = @message_id
AND
channel_id = @channel_id
AND
(CASE
    WHEN sqlc.narg(user_id)::uuid IS NOT NULL
    THEN sqlc.narg(user_id)::uuid = user_id
    ELSE TRUE
END)
RETURNING
id,
channel_id;