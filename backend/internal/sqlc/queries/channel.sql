-- name: CreateGuildChannel :one
INSERT INTO channels (guild_id, name, topic, channel_type, creator_id)
VALUES (@guild_id, @name, @topic, @channel_type, @creator_id)
RETURNING *;

-- name: CreateDirectChannel :one
INSERT INTO channels (channel_type, creator_id)
VALUES (@channel_type, @creator_id)
RETURNING *;

-- name: CreateGuildChannelCategory :one
INSERT INTO channels (guild_id, name, channel_type, creator_id)
VALUES (@guild_id, @name, 1, @creator_id)
RETURNING *;

-- name: UpdateGuildChannel :one
UPDATE channels
SET name = @name, topic = @topic, parent_role_sync = @parent_role_sync, parent_id = @parent_id
WHERE id = @channel_id RETURNING *;

-- name: UpdateGuildChannelCategory :one
UPDATE channels
SET name = @name
WHERE id = @channel_id RETURNING *;

-- name: UpdatePrivateChannel :one
UPDATE channels
SET name = @name, topic = @topic
WHERE id = @channel_id RETURNING *;

-- name: DeleteChannel :execrows
DELETE
FROM channels
WHERE id = @channel_id;

-- name: CreateDirectChannelRecipients :execrows
INSERT INTO channel_users (channel_id, user_id)
SELECT @channel_id, id FROM users
WHERE id = ANY(@user_ids::uuid[]);

-- name: GetManyGuildChannelsByGuildID :many
WITH guild_channels_cte AS (
  SELECT *
  FROM channels
  WHERE guild_id = @guild_id
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

-- name: GetPrivateChannelUserByChannelIDAndUserID :execrows
SELECT user_id
FROM channel_users
WHERE channel_id = @channel_id AND user_id = @user_id;