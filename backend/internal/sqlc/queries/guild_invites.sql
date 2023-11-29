-- name: GetManyGuildInvitesByGuildID :many
SELECT
gi.id,
gi.flags,
gi.used_count,
gi.created_at,
gi.updated_at,
gi.user_id,
CASE
    WHEN gm.nickname IS NOT NULL THEN gm.nickname
    ELSE u.display_name
END::text AS display_name,
u.username,
u.public_flags,
ua.attachment_id
FROM guild_invites gi
INNER JOIN guild_members gm ON gm.user_id = gi.user_id AND gm.guild_id = gi.guild_id
INNER JOIN users u ON u.id = gi.user_id
LEFT JOIN user_attachments ua ON ua.user_id = gi.user_id
WHERE gi.guild_id = @guild_id AND
    (CASE
        WHEN sqlc.narg(before)::uuid IS NOT NULL THEN gi.id < sqlc.narg(before)::uuid
        ELSE TRUE
    END)
    AND 
    (CASE
        WHEN sqlc.narg(after)::uuid IS NOT NULL THEN gi.id > sqlc.narg(after)::uuid
        ELSE TRUE
    END)
ORDER BY gi.id DESC
LIMIT @results_limit;


-- name: GetGuildInviteByID :one
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
    gi.id = @invite_id
),

icon_cte AS (
  SELECT attachment_id, guild_id
  FROM guild_attachments ga
  WHERE guild_id IN (
    SELECT guild_id
    FROM
    guild_guild_invite_cte
  ) AND usage_type = 0
),

banner_cte AS (
  SELECT attachment_id, guild_id
  FROM guild_attachments ga
  WHERE guild_id IN (
    SELECT
    guild_id
    FROM
    guild_guild_invite_cte
  ) AND usage_type = 1
)

SELECT
ggicte.*,
icte.attachment_id AS icon,
bcte.attachment_id AS banner
FROM
guild_guild_invite_cte ggicte
LEFT JOIN
icon_cte icte ON icte IS NOT NULL
LEFT JOIN
banner_cte bcte ON bcte IS NOT NULL;


-- name: CreateGuildInvite :one
INSERT INTO guild_invites (user_id, guild_id)
SELECT gm.user_id, gm.guild_id
FROM guild_members gm
WHERE gm.user_id = @user_id AND gm.guild_id = @guild_id
RETURNING id;

-- name: DeleteGuildInvite :execrows
DELETE 
FROM guild_invites
WHERE id = @guild_invite_id AND guild_id = @guild_id;