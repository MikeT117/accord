-- name: GetManyGuildInvitesByGuildID :many
SELECT *
FROM guild_invites
WHERE guild_id = @guild_id AND
    (CASE
        WHEN sqlc.narg(before)::timestamp IS NOT NULL THEN created_at < sqlc.narg(before)::timestamp
        ELSE TRUE
    END)
    AND 
    (CASE
        WHEN sqlc.narg(after)::timestamp IS NOT NULL THEN created_at > sqlc.narg(after)::timestamp
        ELSE TRUE
    END)
ORDER BY created_at DESC
LIMIT @results_limit;

-- name: CreateGuildInvite :one
INSERT INTO guild_invites (user_id, guild_id)
SELECT gm.user_id, gm.guild_id
FROM guild_members gm
WHERE gm.user_id = @user_id AND gm.guild_id = @guild_id
RETURNING *;

-- name: DeleteGuildInvite :execrows
DELETE 
FROM guild_invites
WHERE id = @guild_invite_id AND guild_id = @guild_id;