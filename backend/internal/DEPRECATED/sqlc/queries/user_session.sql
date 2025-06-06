-- name: CreateUserSession :one
INSERT INTO
user_sessions
(user_id, token, expires_at)
VALUES
(@user_id, @token, @expires_at)
RETURNING
*;

-- name: GetManyUserSessionsByID :many
SELECT
id,
expires_at,
(
    CASE
        WHEN token = @token THEN true
        ELSE false
    END
) AS is_current_session
FROM
user_sessions
WHERE
user_id = @user_id
AND
(CASE
    WHEN sqlc.narg(before)::uuid IS NOT NULL THEN id < sqlc.narg(before)::uuid
    ELSE TRUE
END)
AND 
(CASE
    WHEN sqlc.narg(after)::uuid IS NOT NULL THEN id > sqlc.narg(after)::uuid
    ELSE TRUE
END)
ORDER BY
CASE
    WHEN sqlc.narg(after)::uuid IS NOT NULL THEN id
END ASC,
CASE
    WHEN sqlc.narg(after)::uuid IS NULL THEN id
END DESC
LIMIT @results_limit;


-- name: GetUserSessionByToken :one
SELECT
*
FROM
user_sessions
WHERE
token = @token;

-- name: DeleteUserSession :execrows
DELETE
FROM
user_sessions
WHERE
id = @session_id
AND
user_id = @user_id
AND
token != @token;
