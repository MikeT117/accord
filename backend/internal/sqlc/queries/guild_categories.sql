-- name: CreateOrGetGuildCategory :one
INSERT INTO guild_categories (name)
VALUES (@name)
ON CONFLICT (name) DO UPDATE
SET NAME = guild_categories.name
RETURNING *;


-- name: GetManyGuildCategories :many
SELECT *
FROM guild_categories;