-- name: GetManyUserRelationshipsByUserID :many
WITH relationship_cte AS (
    SELECT
    r.id,
    r.creator_id,
    r.status,
    r.created_at,
    r.updated_at
    FROM
    relationships r
    INNER JOIN
    relationship_users ru ON ru.relationship_id = r.id
    WHERE
    ru.user_id = @user_id
    AND
    (CASE
        WHEN r.status != 2
        THEN TRUE
        ELSE r.creator_id = @user_id
    END)
),

user_cte AS (
    SELECT
    ru.relationship_id,
    u.id AS u_id,
    u.display_name,
    u.username,
    u.public_flags,
    ua.attachment_id
    FROM
    relationship_users ru
    INNER JOIN
    users u ON u.id = ru.user_id
    LEFT JOIN
    user_attachments ua ON ua.user_id = u.id
    INNER JOIN
    relationship_cte rcte ON rcte.id = ru.relationship_id
    WHERE
    u.id != @user_id
)

SELECT
rcte.*,
ucte.*
FROM
relationship_cte rcte
INNER JOIN
user_cte ucte ON ucte.relationship_id = rcte.id;

-- name: GetRelationshipUserIDsByRelationshipID :many
SELECT ru.user_id
FROM relationship_users ru
WHERE ru.relationship_id = @relationship_id;

-- name: CreateRelationship :one
INSERT INTO relationships (status, creator_id)
VALUES (@status, @creator_id)
RETURNING *;

-- name: LinkManyRelationshipUsers :many
WITH users_cte AS (
    SELECT u.id, u.display_name, u.username, u.public_flags, ua.attachment_id
    FROM users u
    LEFT JOIN user_attachments ua ON ua.user_id = u.id
    WHERE u.id = ANY(@user_ids::uuid[])
),

insert_relationship_users_cte AS (
    INSERT INTO relationship_users (relationship_id, user_id)
    SELECT @relationship_id, id
    FROM users_cte
)

SELECT *
FROM
users_cte;

-- name: LinkRelationshipUser :one
WITH users_cte AS (
    SELECT u.id, u.display_name, u.username, u.public_flags, ua.attachment_id
    FROM users u
    LEFT JOIN user_attachments ua ON ua.user_id = u.id
    WHERE u.id = @user_id
),

insert_relationship_users_cte AS (
    INSERT INTO relationship_users (relationship_id, user_id)
    SELECT @relationship_id, id
    FROM users_cte
)

SELECT *
FROM
users_cte;

-- name: UpdateRelationship :one
UPDATE relationships
SET
status = @status
WHERE
id = (
    SELECT
    relationship_id
    FROM
    relationship_users
    WHERE
    relationship_id = @relationship_id
    AND
    user_id = @user_id
)
AND
status = 1
AND
creator_id != @user_id
RETURNING *;

-- name: DeleteRelationship :execrows
DELETE FROM
relationships
WHERE
(creator_id = @user_id AND status = 2)
OR
id = (
    SELECT
    relationship_id
    FROM
    relationship_users
    WHERE
    user_id = @user_id
    AND
    relationship_id = @relationship_id
);

-- name: HasFriendRelationship :one
SELECT true
FROM
relationship_users ru
INNER JOIN
relationships r ON r.id = ru.relationship_id
WHERE
(
    (
    r.creator_id = @request_user_id
    AND
    ru.user_id = ANY(@user_ids::uuid[])
    )
    OR
    (
    r.creator_id = ANY(@user_ids::uuid[])
    AND
    ru.user_id = @request_user_id
    )
)
AND
status = 0
GROUP BY r.id
HAVING COUNT(r.id) = @users_len;

-- name: HasBlockedRelationship :execrows
SELECT true
FROM
relationship_users ru
INNER JOIN
relationships r ON r.id = ru.relationship_id
WHERE
(
    (
    r.creator_id = @request_user_id
    AND
    ru.user_id = @user_id
    )
    OR
    (
    r.creator_id = @user_id
    AND
    ru.user_id = @request_user_id
    )
)
AND
status = 2
GROUP BY r.id
LIMIT 1;