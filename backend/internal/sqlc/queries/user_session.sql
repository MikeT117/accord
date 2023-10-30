-- name: CreateUserSession :one
INSERT INTO user_sessions (user_id, token, expires_at)
VALUES (@user_id, @token, @expires_at)
RETURNING *;

-- name: GetUserSessionByID :one
SELECT *
FROM user_sessions
WHERE id = @session_id;

-- name: GetUserSessionByToken :one
SELECT *
FROM user_sessions
WHERE token = @token;

-- name: GetManyUserSessionsByID :many
SELECT *
FROM user_sessions
WHERE user_id = @user_id;

-- name: DeleteUserSession :exec
DELETE
FROM user_sessions
WHERE id = @session_id;
