-- name: GetUserProfileByIDAndGuildID :one
WITH user_cte AS (
	SELECT
    u.id,
    CASE
        WHEN gm.nickname IS NOT NULL THEN gm.nickname
        ELSE u.display_name
    END::text AS display_name,
    u.username,
    u.public_flags,
    u.created_at,
    ua.attachment_id,
    gm.joined_at
    FROM
    users u
    INNER JOIN
    guild_members gm ON gm.user_id = u.id
    LEFT JOIN
    user_attachments ua ON ua.user_id = u.id
    WHERE
    u.id = @user_id
    AND
    gm.guild_id = @guild_id
),

guild_member_roles_cte AS (
    SELECT
    ARRAY_AGG(gru.role_id) AS roles
    FROM
    guild_members gm
    INNER JOIN
    guild_role_users gru ON gru.user_id = gm.user_id
    WHERE
    gm.user_id = @user_id
    AND
    gm.guild_id = @guild_id
),

mutual_guilds_cte AS (
    SELECT
    ARRAY_AGG(gm.guild_id) AS mutual_guilds
    FROM
    guild_members gm
    WHERE
    gm.user_id = @requestor_id
    OR
    gm.user_id = @user_id
    GROUP BY
    gm.guild_id
)

SELECT
ucte.*,
COALESCE(gmrcte.roles, '{}') AS roles,
COALESCE(mgcte.mutual_guilds, '{}') AS mutual_guilds
FROM
user_cte ucte,
guild_member_roles_cte gmrcte,
mutual_guilds_cte mgcte;


-- name: GetUserProfileByID :one
WITH user_cte AS (
	SELECT
    u.id,
    u.display_name,
    u.username,
    u.public_flags,
    u.created_at,
    ua.attachment_id
    FROM
    users u 
    LEFT JOIN
    user_attachments ua ON ua.user_id = u.id
    WHERE
    u.id = @user_id
),

mutual_guilds_cte AS (
    SELECT
    ARRAY_AGG(gm.guild_id) AS mutual_guilds
    FROM
    guild_members gm
    WHERE
    gm.user_id = @requestor_id
    OR
    gm.user_id = @user_id
    GROUP BY
    gm.guild_id
)

SELECT
ucte.*,
COALESCE(mgcte.mutual_guilds, '{}') AS mutual_guilds
FROM
user_cte ucte,
mutual_guilds_cte mgcte;