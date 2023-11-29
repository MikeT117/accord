-- name: CreateGuildChannel :one
INSERT INTO channels (guild_id, name, topic, channel_type, creator_id)
VALUES (@guild_id, @name, @topic, @channel_type, @creator_id)
RETURNING *;

-- name: UpdateGuildChannel :one
UPDATE channels
SET
parent_id = (
CASE
    WHEN sqlc.narg(parent_id)::uuid IS NOT NULL THEN sqlc.narg(parent_id)::uuid
    ELSE NULL
END
)
WHERE
id = @channel_id
RETURNING *;

-- name: DeleteGuildChannel :execrows
DELETE
FROM
channels
WHERE
id = @channel_id
AND
guild_id = @guild_id::uuid;

-- name: GetGuildChannelByID :one
SELECT
*
FROM
channels
WHERE
id = @channel_id
AND
guild_id = @guild_id::uuid;

-- name: GetManyGuildChannelsByGuildID :many
WITH guild_channels_cte AS (
  SELECT *
  FROM channels
  WHERE guild_id = @guild_id::uuid
),

guild_role_channels_cte AS (
  SELECT channel_id, ARRAY_AGG(role_id) AS roles
  FROM guild_role_channels
  WHERE channel_id IN (
    SELECT id FROM guild_channels_cte
  ) GROUP BY channel_id
)

SELECT gcc.*, grcc.roles::UUID[] as roles
FROM guild_channels_cte gcc
INNER JOIN guild_role_channels_cte grcc ON grcc.channel_id = gcc.id;

-- name: UpdateChannel :one
UPDATE channels
SET
name = (
CASE
    WHEN sqlc.narg(name)::text IS NOT NULL THEN sqlc.narg(name)::text
    ELSE channels.name
END
),
topic = (
CASE
    WHEN sqlc.narg(topic)::text IS NOT NULL THEN sqlc.narg(topic)::text
    ELSE channels.topic
END
)
WHERE
id = @channel_id
RETURNING *;

-- name: CreatePrivateChannel :one
INSERT INTO channels (channel_type, creator_id)
VALUES (@channel_type, @creator_id)
RETURNING *;

-- name: CreatePrivateChannelRecipients :execrows
INSERT INTO channel_users (channel_id, user_id)
SELECT @channel_id, id FROM users
WHERE id = ANY(@user_ids::uuid[]);

-- name: GetPrivateChannelUserByChannelIDAndUserID :execrows
SELECT 1
FROM channel_users
WHERE channel_id = @channel_id AND user_id = @user_id
LIMIT 1;

-- name: GetPrivateChannelByUsers :one
WITH private_channel_cte AS (
    SELECT channel_id
    FROM channel_users
    WHERE user_id = ANY(@user_ids::uuid[])
    GROUP BY channel_id
    HAVING COUNT(*) = @users_len::int
    LIMIT 1
)

SELECT
*
FROM
channels
WHERE
id = (
    SELECT
    channel_id
    FROM
    private_channel_cte
);

-- name: GetPrivateChannelUserIDs :one
Select
ARRAY_AGG(cu.user_id) AS user_ids
FROM
channel_users cu
WHERE
cu.channel_id = $1;