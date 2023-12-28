-- name: GetManyDiscoverableGuilds :many
WITH guilds_cte AS (
    SELECT
    id,
    name,
    description,
    member_count,
    guild_category_id
    FROM
    guilds
    WHERE
    is_discoverable
    AND
    (CASE
        WHEN sqlc.narg(before)::uuid IS NOT NULL THEN id < sqlc.narg(before)::uuid
        ELSE TRUE
    END)
    AND
    (CASE
        WHEN sqlc.narg(after)::uuid IS NOT NULL THEN id > sqlc.narg(after)::uuid
        ELSE TRUE
    END)
    AND
    (CASE
        WHEN sqlc.narg(name)::text IS NOT NULL THEN name ILIKE sqlc.narg(name)::text
        ELSE TRUE
    END)
    AND
    (CASE
        WHEN sqlc.narg(category_id)::uuid IS NOT NULL THEN guild_category_id = sqlc.narg(category_id)::uuid
        ELSE TRUE
    END)
    ORDER BY
    CASE
        WHEN sqlc.narg(after)::uuid IS NOT NULL THEN id
    END ASC,
    CASE
        WHEN sqlc.narg(after)::uuid IS NULL THEN id
    END DESC
    LIMIT
    @results_limit
),

icon_cte AS (
  SELECT
  attachment_id, guild_id
  FROM
  guild_attachments ga
  WHERE
  guild_id IN (
    SELECT
    id
    FROM
    guilds_cte
  ) AND
  usage_type = 0
),

banner_cte AS (
  SELECT
  attachment_id, guild_id
  FROM
  guild_attachments ga
  WHERE
  guild_id IN (
    SELECT
    id
    FROM
    guilds_cte
  ) AND
  usage_type = 1
)

SELECT
gcte.*,
icte.attachment_id as icon,
bcte.attachment_id as banner
FROM
guilds_cte gcte
LEFT JOIN
icon_cte icte ON icte.guild_id = gcte.id
LEFT JOIN
banner_cte bcte ON bcte.guild_id = gcte.id;


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
  SELECT
  attachment_id,
  guild_id
  FROM
  guild_attachments ga
  WHERE
  guild_id IN (
    SELECT
    id
    FROM
    guild_cte
  ) AND
  usage_type = 0
),

banner_cte AS (
  SELECT
  attachment_id, guild_id
  FROM
  guild_attachments ga
  WHERE
  guild_id IN (
    SELECT
    id
    FROM
    guild_cte
  ) AND
  usage_type = 1
)

SELECT
gcte.*,
icte.attachment_id as icon,
bcte.attachment_id as banner
FROM
guild_cte gcte
LEFT JOIN
icon_cte icte ON icte.guild_id = gcte.id
LEFT JOIN
banner_cte bcte ON bcte.guild_id = gcte.id;

-- name: CreateGuild :one
INSERT INTO
guilds
(name, is_discoverable, creator_id, guild_category_id)
VALUES
(@name, @is_discoverable, @creator_id, @guild_category_id)
RETURNING
*;

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
  SELECT
  attachment_id,
  guild_id
  FROM
  guild_attachments ga
  WHERE
  guild_id IN (
    SELECT
    id
    FROM
    updated_guild_cte
  ) AND
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
    id
    FROM
    updated_guild_cte
  ) AND
  usage_type = 1
)

SELECT
ugcte.*,
icte.attachment_id as icon,
bcte.attachment_id as banner
FROM
updated_guild_cte ugcte
LEFT JOIN
icon_cte icte ON icte.guild_id = ugcte.id
LEFT JOIN
banner_cte bcte ON bcte.guild_id = ugcte.id;


-- name: DeleteGuild :exec
DELETE
FROM
guilds
WHERE
id = @guild_id;

-- name: IncrementGuildMemberCount :exec
UPDATE
guilds
SET
member_count = member_count + 1
WHERE
id = @guild_id;

-- name: DecrementGuildMemberCount :exec
UPDATE
guilds
SET
member_count = (
    CASE
        WHEN member_count > 0 THEN member_count - 1
        ELSE member_count
    END
)
WHERE
id = @guild_id;


-- name: IncrementGuildChannelCount :exec
UPDATE
guilds
SET
channel_count = channel_count + 1
WHERE
id = @guild_id;

-- name: DecrementGuildChannelCount :exec
UPDATE
guilds
SET
channel_count = (
    CASE
        WHEN channel_count > 0 THEN channel_count - 1
        ELSE channel_count
    END
)
WHERE
id = @guild_id;