-- name: GetManyGuildMembersByGuildID :many
WITH guild_member_cte AS (
	SELECT
    gm.joined_at,
    CASE
        WHEN gm.nickname IS NOT NULL THEN gm.nickname
        ELSE u.display_name
    END::text AS display_name,
    u.id,
    u.username,
    u.public_flags,
    ua.attachment_id
	FROM guild_members gm
	INNER JOIN users u ON u.id = gm.user_id
	LEFT JOIN user_attachments ua ON ua.user_id = gm.user_id
    WHERE gm.guild_id = @guild_id AND 
    (CASE
        WHEN sqlc.narg(before)::timestamp IS NOT NULL THEN gm.joined_at < sqlc.narg(before)::timestamp
        ELSE TRUE
    END)
    AND
    (CASE
	    WHEN sqlc.narg(after)::timestamp IS NOT NULL THEN gm.joined_at > sqlc.narg(after)::timestamp
	    ELSE TRUE
    END)
	ORDER BY gm.joined_at DESC
	LIMIT @results_limit
),

user_roles_cte AS (
	SELECT gru.user_id, ARRAY_AGG(gru.role_id)::uuid[] AS roles
	FROM guild_role_users gru
    INNER JOIN guild_roles gr ON gr.id = gru.role_id AND gr.guild_id = @guild_id
	INNER JOIN guild_member_cte gmcte ON gmcte.id = gru.user_id
	GROUP BY gru.user_id
)

SELECT gmcte.*, urcte.roles
FROM guild_member_cte gmcte
INNER JOIN user_roles_cte urcte ON urcte.user_id = gmcte.id;

-- name: GetManyGuildBansByGuildID :many
SELECT
    gb.banned_at,
    gb.reason,
    u.id,
    u.display_name,
    u.username,
    u.public_flags,
    ua.attachment_id
FROM guild_bans gb
INNER JOIN users u ON u.id = gb.user_id
LEFT JOIN user_attachments ua ON ua.user_id = u.id
WHERE gb.guild_id = @guild_id AND 
    (CASE
        WHEN sqlc.narg(before)::timestamp IS NOT NULL THEN gb.banned_at < sqlc.narg(before)::timestamp
        ELSE TRUE
    END)
    AND
    (CASE
	    WHEN sqlc.narg(after)::timestamp IS NOT NULL THEN gb.banned_at > sqlc.narg(after)::timestamp
	    ELSE TRUE
    END)
ORDER BY gb.banned_at DESC
LIMIT @results_limit;

-- name: CreateGuildMember :one
INSERT INTO guild_members (nickname, guild_id, user_id)
VALUES (@nickname, @guild_id, @user_id)
RETURNING *;

-- name: DeleteGuildMember :one
DELETE FROM guild_members
WHERE user_id = @user_id AND guild_id = @guild_id
RETURNING user_id, guild_id;

-- name: UpdateGuildMember :execrows
UPDATE guild_members
SET nickname = @nickname
WHERE guild_id = @guild_id AND user_id = @user_id;

-- name: CreateGuildBan :execrows
INSERT INTO guild_bans
(user_id, reason, guild_id, creator_id)
SELECT id, @reason, @guild_id, @creator_id
FROM users
WHERE id = @user_id;

-- name: DeleteGuildBan :execrows
DELETE FROM guild_bans
WHERE user_id  = @user_id AND guild_id = @guild_id;