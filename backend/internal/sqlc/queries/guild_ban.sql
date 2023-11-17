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
        WHEN sqlc.narg(before)::uuid IS NOT NULL THEN gb.user_id < sqlc.narg(before)::uuid
        ELSE TRUE
    END)
    AND
    (CASE
	    WHEN sqlc.narg(after)::uuid IS NOT NULL THEN gb.user_id > sqlc.narg(after)::uuid
	    ELSE TRUE
    END)
ORDER BY gb.user_id DESC
LIMIT @results_limit;

-- name: CreateGuildBan :execrows
INSERT INTO guild_bans
(user_id, reason, guild_id, creator_id)
SELECT id, @reason, @guild_id, @creator_id
FROM users
WHERE id = @user_id;

-- name: DeleteGuildBan :execrows
DELETE FROM guild_bans
WHERE user_id  = @user_id AND guild_id = @guild_id;

-- name: GetGuildBanCountByUserIDAndGuildID :execrows
SELECT
user_id
FROM
guild_bans
WHERE
guild_id = @guild_id
AND
user_id = @user_id;