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
	FROM
    guild_members gm
	INNER JOIN
    users u ON u.id = gm.user_id
	LEFT JOIN
    user_attachments ua ON ua.user_id = gm.user_id
    WHERE
    gm.guild_id = @guild_id
    AND
    (CASE
        WHEN sqlc.narg(before)::uuid IS NOT NULL THEN gm.user_id < sqlc.narg(before)::uuid
        ELSE TRUE
    END)
    AND
    (CASE
	    WHEN sqlc.narg(after)::uuid IS NOT NULL THEN gm.user_id > sqlc.narg(after)::uuid
	    ELSE TRUE
    END)
	LIMIT @results_limit
),

user_roles_cte AS (
	SELECT
    gru.user_id,
    ARRAY_AGG(gru.role_id)::uuid[] AS roles
	FROM
    guild_role_users gru
    INNER JOIN
    guild_roles gr ON gr.id = gru.role_id
    AND
    gr.guild_id = @guild_id
	INNER JOIN
    guild_member_cte gmcte ON gmcte.id = gru.user_id
	GROUP BY
    gru.user_id
)

SELECT
gmcte.*,
urcte.roles
FROM
guild_member_cte gmcte
INNER JOIN
user_roles_cte urcte ON urcte.user_id = gmcte.id
ORDER BY
gmcte.joined_at DESC;


-- name: GetManyUnassignableGuildMembersByGuildIDAndRoleID :many
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
	FROM
    guild_members gm
	INNER JOIN
    users u ON u.id = gm.user_id
    INNER JOIN
    guild_role_users gru ON gru.user_id = gm.user_id
	LEFT JOIN
    user_attachments ua ON ua.user_id = gm.user_id
    WHERE
    gm.guild_id = @guild_id
    AND
    gru.role_id = @role_id
    AND
    (CASE
        WHEN sqlc.narg(before)::uuid IS NOT NULL THEN gm.user_id < sqlc.narg(before)::uuid
        ELSE TRUE
    END)
    AND
    (CASE
	    WHEN sqlc.narg(after)::uuid IS NOT NULL THEN gm.user_id > sqlc.narg(after)::uuid
	    ELSE TRUE
    END)
	LIMIT @results_limit
),

user_roles_cte AS (
	SELECT
    gru.user_id,
    ARRAY_AGG(gru.role_id)::uuid[] AS roles
	FROM
    guild_role_users gru
    INNER JOIN
    guild_roles gr ON gr.id = gru.role_id
    AND
    gr.guild_id = @guild_id
	INNER JOIN
    guild_member_cte gmcte ON gmcte.id = gru.user_id
	GROUP BY
    gru.user_id
)

SELECT
gmcte.*,
urcte.roles
FROM
guild_member_cte gmcte
INNER JOIN
user_roles_cte urcte ON urcte.user_id = gmcte.id
ORDER BY
gmcte.id DESC;


-- name: GetManyAssignableGuildMembersByGuildIDAndRoleID :many
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
	FROM
    guild_members gm
	INNER JOIN
    users u ON u.id = gm.user_id
	LEFT JOIN
    user_attachments ua ON ua.user_id = gm.user_id
    WHERE
    gm.guild_id = @guild_id
    AND
    NOT EXISTS (
        SELECT
        1
        FROM
		guild_role_users gru
		WHERE
        gru.role_id = @role_id
        AND
        gru.user_id = gm.user_id
    )
    AND
    (CASE
        WHEN sqlc.narg(before)::timestamp IS NOT NULL THEN gm.joined_at < sqlc.narg(before)::timestamp
        ELSE TRUE
    END)
    AND
    (CASE
	    WHEN sqlc.narg(after)::timestamp IS NOT NULL THEN gm.joined_at > sqlc.narg(after)::timestamp
	    ELSE TRUE
    END)
    ORDER BY 
    CASE
        WHEN sqlc.narg(after)::timestamp IS NOT NULL THEN gm.joined_at
    END ASC,
    CASE
        WHEN sqlc.narg(after)::timestamp IS NULL THEN gm.joined_at
    END DESC
	LIMIT @results_limit
),

user_roles_cte AS (
	SELECT
    gru.user_id,
    ARRAY_AGG(gru.role_id)::uuid[] AS roles
	FROM
    guild_role_users gru
    INNER JOIN
    guild_roles gr ON gr.id = gru.role_id
    AND
    gr.guild_id = @guild_id
	INNER JOIN
    guild_member_cte gmcte ON gmcte.id = gru.user_id
	GROUP BY
    gru.user_id
)

SELECT
gmcte.*,
urcte.roles
FROM
guild_member_cte gmcte
INNER JOIN
user_roles_cte urcte ON urcte.user_id = gmcte.id
ORDER BY
gmcte.joined_at DESC;


-- name: CreateGuildMember :one
INSERT INTO
guild_members
(nickname, guild_id, user_id)
VALUES
(@nickname, @guild_id, @user_id)
RETURNING *;

-- name: DeleteGuildMember :one
DELETE FROM
guild_members
WHERE
user_id = @user_id
AND
guild_id = @guild_id
RETURNING
user_id,
guild_id;

-- name: UpdateGuildMember :execrows
UPDATE
guild_members
SET
nickname = @nickname
WHERE
guild_id = @guild_id
AND
user_id = @user_id;

-- name: HasMutualGuilds :one
WITH request_user_guilds AS (
    SELECT
    guild_id
    FROM
    guild_members
    WHERE
    user_id = @request_user_id::uuid
)

SELECT CASE WHEN EXISTS (
	SELECT FROM
	guild_members gm
	WHERE
	gm.user_id = ANY(@user_ids::uuid[])
	AND
	gm.guild_id IN (
	SELECT
		guild_id
	FROM
		request_user_guilds
	)
	GROUP BY
    gm.user_id
	HAVING COUNT(gm.user_id) = @users_count::int
)
THEN TRUE
ELSE FALSE END;