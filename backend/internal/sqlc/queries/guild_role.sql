-- name: CreatGuildRole :one
INSERT INTO
guild_roles
(name, creator_id, guild_id, permissions)
VALUES
(@name, @creator_id, @guild_id, @permissions)
RETURNING
*;

-- name: UpdateGuildRole :one
UPDATE
guild_roles
SET
name = @name,
permissions = @permissions,
updated_at = NOW()
WHERE
id = @role_id
AND
guild_id = @guild_id
RETURNING
*;

-- name: DeleteGuildRole :execrows
DELETE
FROM
guild_roles
WHERE
id = @role_id
AND
guild_id = @guild_id;

-- name: AssignRoleToManyUsers :execrows
INSERT INTO
guild_role_users
(role_id, user_id)
SELECT
gr.id,
gm.user_id
FROM
guild_members gm
INNER JOIN
guild_roles gr ON gr.guild_id = gm.guild_id
WHERE
gm.user_id = ANY(@user_ids::uuid[])
AND
gr.id = @role_id
AND
gm.guild_id = @guild_id;

-- name: AssignManyRolesToUser :execrows
INSERT INTO
guild_role_users
(role_id, user_id)
SELECT
gr.id,
gm.user_id
FROM 
guild_members gm
INNER JOIN
guild_roles gr ON gr.guild_id = gm.guild_id
WHERE
gm.user_id = @user_id
AND
gr.id = ANY(@role_ids::uuid[])
AND
gm.guild_id = @guild_id;

-- name: AssignRoleToManyGuildChannels :execrows
INSERT INTO
guild_role_channels
(role_id, channel_id)
SELECT
gr.id,
c.id
FROM
channels c
INNER JOIN
guild_roles gr ON gr.guild_id = c.guild_id
WHERE
c.id = ANY(@channel_ids::uuid[])
AND
gr.id = @role_id
AND
gr.guild_id = @guild_id;

-- name: AssignManyRolesToGuildChannel :execrows
INSERT INTO
guild_role_channels (role_id, channel_id)
SELECT
gr.id,
c.id
FROM
channels c
INNER JOIN
guild_roles gr ON gr.guild_id = c.guild_id
WHERE
c.id = @channel_id
AND
gr.id = ANY(@role_ids::uuid[])
AND
gr.guild_id = @guild_id;

-- name: AssignDefaultRoleToManyGuildChannels :one
INSERT INTO
guild_role_channels
(role_id, channel_id)
SELECT
gr.id,
c.id
FROM
channels c
INNER JOIN
guild_roles gr ON gr.guild_id = c.guild_id
WHERE
c.id = ANY(@channel_ids::uuid[])
AND
gr.name = '@default'
AND
gr.guild_id = @guild_id
RETURNING
role_id;

-- name: AssignOwnerRoleToManyGuildChannels :one
INSERT INTO
guild_role_channels
(role_id, channel_id)
SELECT
gr.id,
c.id
FROM
channels c
INNER JOIN
guild_roles gr ON gr.guild_id = c.guild_id
WHERE
c.id = ANY(@channel_ids::uuid[])
AND
gr.name = '@owner'
AND
gr.guild_id = @guild_id
RETURNING
role_id;

-- name: AssignDefaultRoleToUser :one
INSERT INTO
guild_role_users
(role_id, user_id)
SELECT
gr.id,
gm.user_id
FROM
guild_members gm
INNER JOIN
guild_roles gr ON gr.guild_id = gm.guild_id
WHERE
gm.user_id = @user_id
AND
gr.name = '@default'
AND
gm.guild_id = @guild_id
RETURNING
role_id;

-- name: UnassignRoleFromUser :execrows
DELETE
FROM
guild_role_users
WHERE
role_id = @role_id
AND
user_id = @user_id;

-- name: UnassignRoleFromGuildChannel :execrows
DELETE
FROM
guild_role_channels
WHERE
role_id = @role_id
AND
channel_id = @channel_id;

-- name: UnassignRoleFromManyGuildChannels :execrows
DELETE FROM
guild_role_channels
WHERE 
role_id = @role_id
AND
channel_id = ANY(@channel_ids::uuid[]);

-- name: UnassignAllRolesFromUser :many
DELETE
FROM
guild_role_users
WHERE
user_id = @user_id
AND
role_id IN (
    SELECT
        id
    FROM
        guild_roles
    WHERE
        guild_id = @guild_id
)
RETURNING
role_id;

-- name: GetManyGuildRolesByGuildID :many
SELECT
*
FROM
guild_roles
WHERE
guild_id = @guild_id;

-- name: GetDefaultGuildRole :one
SELECT
id
FROM
guild_roles
WHERE
guild_id = @guild_id
AND
name = '@default';

-- name: GetManyGuildRoleIDsByUserID :many
SELECT
role_id
FROM
guild_role_users
WHERE
user_id = @user_id;

-- name: GetGuildRolePermissionsByUserIDAndGuildID :one
Select
COALESCE(bit_or(gr.permissions), -1)::int as permissions
FROM
guild_roles gr
INNER JOIN
guild_role_users gru ON gru.role_id = gr.id
WHERE
gr.guild_id = @guild_id
AND
gru.user_id = @user_id;

-- name: GetGuildRolePermissionsByUserIDAndChannelID :one
Select
COALESCE(bit_or(gr.permissions), -1)::int as permissions
FROM
guild_roles gr
INNER JOIN
guild_role_users gru ON gru.role_id = gr.id
INNER JOIN
guild_role_channels grc ON grc.role_id = gr.id
WHERE
gru.user_id = @user_id
AND
grc.channel_id = @channel_id;

-- name: GetRoleIDsByChannelID :many
Select
grc.role_id
FROM
guild_role_channels grc
WHERE
grc.channel_id = @channel_id;

-- name: UnassignAllRolesFromChannel :many
DELETE
FROM
guild_role_channels
WHERE
channel_id = @channel_id
RETURNING
role_id;

-- name: AssignParentRolesToChannel :many
INSERT INTO
guild_role_channels
(role_id, channel_id)
SELECT
grc.role_id,
@channel_id
FROM
guild_role_channels grc
WHERE
channel_id = @parent_id
RETURNING
role_id;

-- name: GetSyncedChannelIDsByParentID :many
WITH parent_channel_roles_cte AS (
	SELECT
	ARRAY_AGG(role_id) role_ids
	FROM
	guild_role_channels
	WHERE
	channel_id = @parent_id::uuid
),

child_channels_roles_cte AS (
	SELECT
	c.id,
	ARRAY_AGG(grc.role_id) role_ids
	FROM
	guild_role_channels grc
	INNER JOIN
	channels c ON c.id = grc.channel_id
	WHERE
    c.parent_id = @parent_id::uuid
	GROUP BY
    c.id
)

SELECT
ccrcte.id
FROM
child_channels_roles_cte ccrcte, parent_channel_roles_cte pcrcte
WHERE
array_length(ccrcte.role_ids, 1) = array_length(pcrcte.role_ids, 1)
AND
ccrcte.role_ids @> pcrcte.role_ids;