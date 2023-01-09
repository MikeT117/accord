CREATE EXTENSION "uuid-ossp" SCHEMA public;

CREATE EXTENSION pgcrypto SCHEMA public;

CREATE TABLE oauth_account (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
  type VARCHAR(255),
  provider varchar(255),
  provider_account_id varchar(255) NOT NULL,
  refresh_token text,
  access_token text,
  expires_at TIMESTAMPTZ,
  token_type varchar(255),
  scope varchar(255),
  id_token varchar(255),
  session_state varchar(255),
  oauth_token_secret text,
  oauth_token text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provider, provider_account_id)
);
CREATE UNIQUE INDEX ON oauth_account (provider_account_id, provider);

CREATE TABLE user_account (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
  oauth_account_id uuid REFERENCES oauth_account (id) ON DELETE SET NULL,
  display_name text NOT NULL,
  email text,
  email_verified boolean NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  flags Int NOT NULL DEFAULT 1, -- 0: Inactive, 1: Active
  relationship_count int NOT NULL DEFAULT 0
);

CREATE TABLE user_session (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
  user_account_id uuid NOT NULL REFERENCES user_account (id),
  token varchar(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(token)
);
CREATE UNIQUE INDEX ON user_session (token);

CREATE TABLE user_relationship (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
  STATUS int NOT NULL, -- 0 friends, 1 pending, 2 blocked
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  initiator_user_account_id uuid NOT NULL REFERENCES user_account (id),
  recipient_user_account_id uuid NOT NULL REFERENCES user_account (id),
  UNIQUE (initiator_user_account_id, recipient_user_account_id)
);

CREATE TABLE guild_category (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
  name text NOT NULL,
  UNIQUE (name)
);

CREATE TABLE guild (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_discoverable boolean DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  owner_user_account_id uuid REFERENCES user_account (id),
  guild_category_id uuid REFERENCES guild_category (id) ON DELETE SET NULL,
  channel_count int NOT NULL DEFAULT 0,
  member_count int NOT NULL DEFAULT 1
);

CREATE TABLE guild_role (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
  name text NOT NULL,
  guild_id uuid NOT NULL REFERENCES guild (id) ON DELETE CASCADE,
  view_guild_channel boolean NOT NULL DEFAULT FALSE,
  manage_guild_channels boolean NOT NULL DEFAULT FALSE,
  create_channel_message boolean NOT NULL DEFAULT FALSE,
  manage_channel_messages boolean NOT NULL DEFAULT FALSE,
  manage_guild boolean NOT NULL DEFAULT FALSE,
  guild_admin boolean NOT NULL DEFAULT FALSE
);

CREATE TABLE guild_member (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4 (),
  nickname text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guild_id uuid NOT NULL REFERENCES guild (id) ON DELETE CASCADE,
  user_account_id uuid NOT NULL REFERENCES user_account (id),
  is_banned boolean NOT NULL DEFAULT false,
  ban_reason text,
  banned_by_guild_member_id uuid REFERENCES guild_member (id),
  ban_date TIMESTAMPTZ
);

CREATE TABLE guild_role_guild_members (
  guild_role_id uuid NOT NULL REFERENCES guild_role (id) ON DELETE CASCADE,
  guild_member_id uuid NOT NULL REFERENCES guild_member (id) ON DELETE CASCADE,
  PRIMARY KEY(guild_role_id, guild_member_id)
);
CREATE UNIQUE INDEX ON guild_role_guild_members (guild_member_id, guild_role_id);

CREATE TABLE channel (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
  name text,
  topic text,
  TYPE int NOT NULL, -- 0 GuildChannel | 1 GuildChannelCategory | 2 DirectMessageChannel | 3 GroupMessageChannel | 4 VoiceChannel
  parent_role_sync boolean NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  parent_id uuid REFERENCES channel (id) ON DELETE SET NULL,
  guild_id uuid REFERENCES guild (id) ON DELETE CASCADE
);

CREATE TABLE voice_channel_state (
  channel_id uuid NOT NULL REFERENCES channel (id),
  user_account_id uuid NOT NULL REFERENCES user_account (id),
  guild_id uuid NOT NULL REFERENCES guild (id),
  mute boolean NOT NULL DEFAULT FALSE,
  self_mute boolean NOT NULL DEFAULT FALSE,
  self_deaf boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY(channel_id, user_account_id)
);
CREATE UNIQUE INDEX ON voice_channel_state (user_account_id, channel_id);

CREATE TABLE channel_user_accounts (
  user_account_id uuid NOT NULL REFERENCES user_account (id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES channel (id) ON DELETE CASCADE,
  PRIMARY KEY(user_account_id, channel_id)
);
CREATE UNIQUE INDEX ON channel_user_accounts (channel_id, user_account_id);

CREATE TABLE guild_invite (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
  STATUS int NOT NULL DEFAULT 1,
  -- 0: disabled | 1: active
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_count int NOT NULL DEFAULT 0,
  guild_member_id uuid NOT NULL REFERENCES guild_member (id) ON DELETE CASCADE,
  guild_id uuid REFERENCES guild (id) ON DELETE CASCADE
);

CREATE TABLE guild_role_channels (
  guild_role_id uuid NOT NULL REFERENCES guild_role (id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES channel (id) ON DELETE CASCADE,
  PRIMARY KEY(guild_role_id, channel_id)
);
CREATE UNIQUE INDEX ON guild_role_channels (channel_id, guild_role_id);

CREATE TABLE channel_message (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
  content text DEFAULT '',
  is_pinned boolean NOT NULL DEFAULT FALSE,
  flags int NOT NULL DEFAULT 1,
  author_user_account_id uuid NOT NULL REFERENCES user_account (id),
  channel_id uuid NOT NULL REFERENCES channel (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attachment (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4 (),
  name text,
  height bigint,
  width bigint,
  src text NOT NULL,
  size bigint,
  resource_type text,
  signature text,
  timestamp bigint,
  public_id text
);

CREATE TABLE channel_message_attachments (
  channel_message_id uuid NOT NULL REFERENCES channel_message (id) ON DELETE CASCADE,
  attachment_id uuid NOT NULL REFERENCES attachment (id) ON DELETE CASCADE,
  PRIMARY KEY (channel_message_id, attachment_id)
);
CREATE UNIQUE INDEX ON channel_message_attachments (attachment_id, channel_message_id);

CREATE TABLE guild_attachments (
  guild_id uuid NOT NULL REFERENCES guild (id) ON DELETE CASCADE,
  attachment_id uuid NOT NULL REFERENCES attachment (id) ON DELETE CASCADE,
  type int NOT NULL DEFAULT 0, -- 0: Icon | 1: Banner
  PRIMARY KEY (guild_id, attachment_id)
);
CREATE UNIQUE INDEX ON guild_attachments (attachment_id, guild_id);


CREATE TABLE user_account_attachments (
  user_account_id uuid NOT NULL REFERENCES user_account (id) ON DELETE CASCADE,
  attachment_id uuid NOT NULL REFERENCES attachment (id) ON DELETE CASCADE,
  PRIMARY KEY (user_account_id, attachment_id)
);
CREATE UNIQUE INDEX ON user_account_attachments (attachment_id, user_account_id);

INSERT INTO
  guild_category (name)
VALUES
  ('General'), ('Gaming'), ('Music'), ('Entertainment'), ('Education'), ('Science & Tech');
