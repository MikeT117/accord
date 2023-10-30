-- name: GetRelationshipUsersByRelationshipID :many
SELECT u.id, u.display_name, u.username, u.public_flags
FROM relationship_users ru
INNER JOIN users u ON u.id = ru.user_id
WHERE relationship_id = @relationship_id;

-- name: CreateRelationship :one
INSERT INTO relationships (status, creator_id)
VALUES (1, @creator_id)
RETURNING *;

-- name: LinkRelationshipUsers :many
WITH users_cte AS (
    SELECT u.id, u.display_name, u.username, u.public_flags, ua.attachment_id
    FROM users u
    INNER JOIN user_attachments ua ON ua.user_id = u.id
    WHERE u.id = ANY(@user_ids::uuid[])
),

insert_relationship_users_cte AS (
    INSERT INTO relationship_users (relationship_id, user_id)
    SELECT @relationship_id, id
    FROM users_cte
    RETURNING *
)

SELECT ucrte.*
FROM
users_cte;

-- name: UpdateRelationship :one
UPDATE relationships
SET status = @status
WHERE id = @relationship_id
RETURNING *;

-- name: DeleteRelationship :exec
DELETE
FROM relationships
WHERE id = @relationship_id;