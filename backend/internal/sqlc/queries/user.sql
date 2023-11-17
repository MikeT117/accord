-- name: CreateOrGetUser :one
INSERT INTO users (display_name, username, oauth_account_id)
VALUES (@display_name, @username, @oauth_account_id)
ON CONFLICT (oauth_account_id) DO UPDATE
SET display_name = users.display_name
RETURNING *;

-- name: GetUserByID :one
SELECT u.*, ua.attachment_id
FROM users u
LEFT JOIN user_attachments ua ON ua.user_id = u.id
WHERE u.id = @user_id;

-- name: GetManyUsersByIDs :many
SELECT u.*, ua.attachment_id
FROM users u
LEFT JOIN user_attachments ua ON ua.user_id = u.id
WHERE u.id = ANY (@user_ids::uuid[]);

-- name: UpdateUser :one
WITH updated_user_cte AS (
    UPDATE
    users
    SET
    display_name = @display_name,
    public_flags = @public_flags
    WHERE
    id = @user_id
    RETURNING
    id,
    display_name,
    public_flags
)

SELECT
uucte.*,
ua.attachment_id
FROM
updated_user_cte uucte
LEFT JOIN
user_attachments ua ON ua.user_id = uucte.id;


-- name: GetUserByUsername :one
SELECT
u.id,
u.username,
u.display_name,
u.public_flags,
u.created_at
FROM
users u
WHERE
u.username = @username;