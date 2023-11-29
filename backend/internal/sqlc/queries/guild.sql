-- name: GetManyDiscoverableGuilds :many
WITH guilds_cte AS (
    SELECT
    id,
    name,
    description,
    member_count,
    guild_category_id,
    created_at
    FROM
    guilds
    WHERE
    is_discoverable
    AND
    (CASE
        WHEN sqlc.narg(before)::timestamp IS NOT NULL THEN created_at < sqlc.narg(before)::timestamp
        ELSE TRUE
    END)
    AND
    (CASE
        WHEN sqlc.narg(after)::timestamp IS NOT NULL THEN created_at > sqlc.narg(after)::timestamp
        ELSE TRUE
    END)
    AND
    (CASE
        WHEN sqlc.narg(name)::text IS NOT NULL THEN name ILIKE sqlc.narg(name)::text
        ELSE TRUE
    END)
    LIMIT
    @results_limit
),

icon_cte AS (
  SELECT attachment_id, guild_id
  FROM guild_attachments ga
  WHERE guild_id IN (
    SELECT id
    FROM guilds_cte
  ) AND usage_type = 0
),

banner_cte AS (
  SELECT attachment_id, guild_id
  FROM guild_attachments ga
  WHERE guild_id IN (
    SELECT id FROM guilds_cte
  ) AND usage_type = 1
)

SELECT gcte.*, icte.attachment_id as icon, bcte.attachment_id as banner
FROM guilds_cte gcte
LEFT JOIN icon_cte icte ON icte.guild_id = gcte.id
LEFT JOIN banner_cte bcte ON bcte.guild_id = gcte.id;


-- name: GetGuildDiscoverableStatusByID :one
SELECT
is_discoverable
FROM
guilds
WHERE
id = @guild_id;

-- name: GetGuildByID :one
WITH guild_cte AS (
    SELECT
    *
    FROM
    guilds
    WHERE
    id = @guild_id
),

icon_cte AS (
  SELECT attachment_id, guild_id
  FROM guild_attachments ga
  WHERE guild_id IN (
    SELECT id
    FROM guild_cte
  ) AND usage_type = 0
),

banner_cte AS (
  SELECT attachment_id, guild_id
  FROM guild_attachments ga
  WHERE guild_id IN (
    SELECT id FROM guild_cte
  ) AND usage_type = 1
)

SELECT gcte.*, icte.attachment_id as icon, bcte.attachment_id as banner
FROM guild_cte gcte
LEFT JOIN icon_cte icte ON icte.guild_id = gcte.id
LEFT JOIN banner_cte bcte ON bcte.guild_id = gcte.id;

-- name: CreateGuild :one
INSERT INTO guilds (name, is_discoverable, creator_id, guild_category_id)
VALUES (@name, @is_discoverable, @creator_id, @guild_category_id)
RETURNING *;

-- name: UpdateGuild :one
WITH updated_guild_cte AS (
    UPDATE
    guilds
    SET
    name = @name,
    description = @description,
    is_discoverable = @is_discoverable,
    guild_category_id = @guild_category_id
    WHERE
    id = @guild_id
    RETURNING
    *
),

icon_cte AS (
  SELECT attachment_id, guild_id
  FROM guild_attachments ga
  WHERE guild_id IN (
    SELECT
    id
    FROM
    updated_guild_cte
  ) AND usage_type = 0
),

banner_cte AS (
  SELECT attachment_id, guild_id
  FROM guild_attachments ga
  WHERE guild_id IN (
    SELECT
    id
    FROM
    updated_guild_cte
  ) AND usage_type = 1
)

SELECT ugcte.*, icte.attachment_id as icon, bcte.attachment_id as banner
FROM updated_guild_cte ugcte
LEFT JOIN icon_cte icte ON icte.guild_id = ugcte.id
LEFT JOIN banner_cte bcte ON bcte.guild_id = ugcte.id;


-- name: DeleteGuild :exec
DELETE
FROM guilds
WHERE id = @guild_id;