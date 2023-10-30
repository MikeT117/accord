-- name: CreateOrGetOAuth :one
INSERT INTO oauth_accounts (email, provider, provider_token, provider_id)
VALUES (@email, @provider, @provider_token, @provider_id)
ON CONFLICT ON CONSTRAINT oauth_accounts_provider_provider_id_key DO UPDATE SET provider_token = @provider_token
RETURNING *;