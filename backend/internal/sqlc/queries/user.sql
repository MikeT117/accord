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