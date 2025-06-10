-- +goose Up
-- +goose StatementBegin
SELECT "up SQL query";

CREATE TABLE IF NOT EXISTS "user" (
    "id" UUID PRIMARY KEY NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "display_name" VARCHAR(32) NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT False,
    "public_flags" INT NOT NULL DEFAULT 0,
    "relationship_count" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL,
    "avatar_id" UUID REFERENCES "attachment" ("id"),
    "banner_id" UUID REFERENCES "attachment" ("id"),
    UNIQUE ("username")
);

CREATE TABLE IF NOT EXISTS "account" (
    "id" UUID PRIMARY KEY NOT NULL,
    "user_id" UUID NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    "account_id" UUID DEFAULT null,
    "provider_id" UUID DEFAULT null,
    "access_token" TEXT DEFAULT null,
    "refresh_token" TEXT DEFAULT null,
    "access_token_expires_at" TIMESTAMPTZ,
    "refresh_token_expires_at" TIMESTAMPTZ,
    "scope" TEXT DEFAULT null,
    "id_token" TEXT DEFAULT null,
    "password" TEXT DEFAULT null,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
    "id" UUID PRIMARY KEY NOT NULL,
    "user_id" UUID NOT NULL REFERENCES "user" ("id"),
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "ip_address" TEXT DEFAULT null,
    "user_agent" TEXT DEFAULT null,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL
);

-- PENDING = 0
-- FRIENDS = 1
-- BLOCKED = 2

CREATE TABLE IF NOT EXISTS "user_relationship" (
    "id" UUID PRIMARY KEY NOT NULL,
    "creator_id" UUID NOT NULL REFERENCES "user" ("id"),
    "recipient_id" UUID NOT NULL REFERENCES "user" ("id"),
    "status" INT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    UNIQUE ("creator_id", "recipient_id")
);

CREATE TABLE IF NOT EXISTS "guild_category" (
    "id" UUID PRIMARY KEY,
    "name" text NOT NULL UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    UNIQUE ("name")
);

CREATE TABLE IF NOT EXISTS "guild" (
    "id" UUID PRIMARY KEY,
    "creator_id" UUID NOT NULL REFERENCES "user" ("id"),
    "guild_category_id" UUID REFERENCES "guild_category" ("id") ON DELETE SET NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(512) NOT NULL,
    "discoverable" BOOLEAN NOT NULL,
    "channel_count" INT NOT NULL,
    "member_count" INT NOT NULL,
    "icon_id" UUID REFERENCES "attachment" ("id"),
    "banner_id" UUID REFERENCES "attachment" ("id") "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
);

CREATE TABLE IF NOT EXISTS "guild_member" (
    "user_id" UUID NOT NULL REFERENCES "user" ("id"),
    "guild_id" UUID NOT NULL REFERENCES "guild" ("id") ON DELETE CASCADE,
    "nickname" VARCHAR(32),
    "avatar_id" UUID REFERENCES "attachment" ("id"),
    "banner_id" UUID REFERENCES "attachment" ("id"),
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    PRIMARY KEY ("guild_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "guild_ban" (
    "user_id" UUID NOT NULL REFERENCES "user" ("id"),
    "guild_id" UUID NOT NULL REFERENCES "guild" ("id") ON DELETE CASCADE,
    "reason" VARCHAR(512) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    UNIQUE ("user_id", "guild_id")
);

CREATE TABLE IF NOT EXISTS "guild_role" (
    "id" UUID PRIMARY KEY,
    "guild_id" UUID NOT NULL REFERENCES "guild" ("id") ON DELETE CASCADE,
    "name" VARCHAR(100) NOT NULL,
    "permissions" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS "guild_invite" (
    "id" UUID PRIMARY KEY,
    "used_count" int NOT NULL DEFAULT 0,
    "guild_id" uuid NOT NULL REFERENCES "guild" (id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL
);

--- CHANNEL TYPE ---
-- GUILD_CHANNEL = 0
-- GUILD_VOICE_CHANNEL = 1
-- GUILD_CATEGORY_CHANNEL = 2
-- DM_CHANNEL = 3
-- GROUP_DM_CHANNEL = 4

CREATE TABLE IF NOT EXISTS "channel" (
    "id" UUID PRIMARY KEY,
    "creator_id" UUID REFERENCES "user" ("id"),
    "guild_id" UUID REFERENCES "guild" ("id") ON DELETE CASCADE,
    "parent_id" UUID REFERENCES "channel" ("id") ON DELETE SET NULL,
    "name" varchar(100) NOT NULL,
    "topic" varchar(512) NOT NULL,
    "channel_type" INT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL
);

--- FLAG ---
-- HIDDEN = 0
-- VISIBLE = 1

CREATE TABLE IF NOT EXISTS "channel_message" (
    "id" uuid PRIMARY KEY,
    "content" TEXT,
    "pinned" BOOLEAN NOT NULL,
    "flag" INT NOT NULL,
    "author_id" uuid NOT NULL REFERENCES "user" ("id"),
    "channel_id" uuid NOT NULL REFERENCES "channel" ("id") ON DELETE CASCADE,
    "guild_id" uuid REFERENCES "guild" ("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS "attachment" (
    "id" UUID NOT NULL PRIMARY KEY,
    "resource_type" VARCHAR(128) NOT NULL,
    "signature" TEXT NOT NULL,
    "owner_id" UUID NOT NULL REFERENCES "user" ("id"),
    "height" INT,
    "width" INT,
    "filesize" INT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "status" INT NOT NULL
);

CREATE TABLE IF NOT EXISTS "voice_state" (
    "id" UUID NOT NULL PRIMARY KEY,
    "self_mute" boolean NOT NULL,
    "self_deaf" boolean NOT NULL,
    "channel_id" uuid NOT NULL REFERENCES "channel" ("id"),
    "user_id" uuid NOT NULL REFERENCES "user" ("id"),
    "guild_id" uuid REFERENCES "guild" ("id"),
    UNIQUE ("channel_id", "user_id")
);

-- Join Tables Begin --

CREATE TABLE IF NOT EXISTS "channel_message_attachment" (
    "channel_message_id" uuid NOT NULL REFERENCES "channel_message" ("id") ON DELETE CASCADE,
    "attachment_id" uuid NOT NULL REFERENCES "attachment" ("id") ON DELETE CASCADE,
    PRIMARY KEY ("message_id", "attachment_id")
);

CREATE TABLE IF NOT EXISTS "guild_role_user" (
    "role_id" UUID NOT NULL REFERENCES "guild_role" ("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "user" ("id"),
    PRIMARY KEY ("role_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "channel_user" (
    "user_id" UUID NOT NULL REFERENCES "user" ("id"),
    "channel_id" UUID NOT NULL REFERENCES "channel" ("id"),
    PRIMARY KEY ("user_id", "channel_id")
);

CREATE TABLE IF NOT EXISTS "guild_role_channel" (
    "role_id" uuid NOT NULL REFERENCES "guild_role" ("id") ON DELETE CASCADE,
    "channel_id" uuid NOT NULL REFERENCES "channel" ("id") ON DELETE CASCADE,
    PRIMARY KEY ("role_id", "channel_id")
);

-- Join Tables End --

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT "down SQL query";
-- +goose StatementEnd