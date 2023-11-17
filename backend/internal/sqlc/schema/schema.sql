CREATE EXTENSION pg_uuidv7 SCHEMA public;

CREATE TABLE oauth_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7 (),
  email text NOT NULL UNIQUE,
  provider varchar(255) NOT NULL,
  provider_token text NOT NULL,
  provider_id varchar(255) NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7 (),
  username varchar (32) NOT NULL UNIQUE,
  display_name varchar (32) NOT NULL,
  public_flags int NOT NULL DEFAULT 1,
  relationship_count int NOT NULL DEFAULT 0,
  oauth_account_id uuid NOT NULL UNIQUE REFERENCES oauth_accounts (id),
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7 (),
  token text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES users (id),
  expires_at timestamp without time zone NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE relationships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7 (),
  creator_id uuid NOT NULL REFERENCES users (id),
  status int NOT NULL, -- 0 friends, 1 pending, 2 blocked
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE relationship_users (
    relationship_id uuid NOT NULL REFERENCES relationships (id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (relationship_id, user_id)
);

CREATE UNIQUE INDEX ON relationship_users (user_id, relationship_id);


CREATE TABLE guild_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7 (),
  name text NOT NULL UNIQUE,
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  UNIQUE (name)
);

CREATE TABLE guilds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7 (),
  name varchar (100) NOT NULL,
  description varchar(500) NOT NULL DEFAULT '',
  is_discoverable boolean NOT NULL DEFAULT FALSE,
  channel_count int NOT NULL DEFAULT 0,
  member_count int NOT NULL DEFAULT 1,
  creator_id uuid NOT NULL REFERENCES users (id),
  guild_category_id uuid REFERENCES guild_categories (id) ON DELETE SET NULL,
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE guild_members (
  nickname varchar(32),
  joined_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
  user_id uuid NOT NULL REFERENCES users (id),
  guild_id uuid NOT NULL REFERENCES guilds (id) ON DELETE CASCADE,
  PRIMARY KEY(guild_id, user_id)
);
CREATE UNIQUE INDEX ON guild_members (user_id, guild_id);

CREATE TABLE guild_bans (
    user_id uuid NOT NULL REFERENCES users(id),
    guild_id uuid NOT NULL REFERENCES guilds(id),
    reason varchar(512) NOT NULL,
    creator_id uuid NOT NULL REFERENCES users(id),
    banned_at timestamp without time zone NOT NULL DEFAULT NOW(),
    PRIMARY KEY(guild_id, user_id)
);
CREATE UNIQUE INDEX ON guild_bans (user_id, guild_id);

CREATE TABLE guild_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7 (),
  name varchar(100) NOT NULL,
  permissions int NOT NULL DEFAULT 0,
  guild_id uuid NOT NULL REFERENCES guilds (id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES users(id),
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);
CREATE INDEX guild_roles_idx_guild_id ON guild_roles (guild_id);

CREATE TABLE guild_role_users (
  role_id uuid NOT NULL REFERENCES guild_roles (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  PRIMARY KEY(role_id, user_id)
);
CREATE UNIQUE INDEX ON guild_role_users (user_id, role_id);

CREATE TABLE channels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7 (),
  name varchar(100) NOT NULL DEFAULT '',
  topic varchar(512) NOT NULL DEFAULT '',
  channel_type smallint NOT NULL, -- 0 GuildChannel | 1 GuildChannelCategory | 2 DirectMessageChannel | 3 GroupMessageChannel | 4 VoiceChannel
  parent_id uuid REFERENCES channels (id) ON DELETE SET NULL,
  creator_id uuid NOT NULL REFERENCES users (id),
  guild_id uuid REFERENCES guilds (id) ON DELETE CASCADE,
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX channels_idx_guild_id ON channels (guild_id);

CREATE TABLE voice_channel_states (
  mute boolean NOT NULL DEFAULT FALSE,
  self_mute boolean NOT NULL DEFAULT FALSE,
  self_deaf boolean NOT NULL DEFAULT FALSE,
  channel_id uuid NOT NULL REFERENCES channels (id),
  user_id uuid NOT NULL REFERENCES users (id),
  guild_id uuid NOT NULL REFERENCES guilds (id),
  PRIMARY KEY(channel_id, user_id)
);
CREATE UNIQUE INDEX ON voice_channel_states (user_id, channel_id);

CREATE TABLE channel_users (
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES channels (id) ON DELETE CASCADE,
  PRIMARY KEY(user_id, channel_id)
);
CREATE UNIQUE INDEX ON channel_users (channel_id, user_id);

CREATE TABLE guild_invites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7 (),
  flags smallint NOT NULL DEFAULT 1, -- 0: disabled | 1: active
  used_count int NOT NULL DEFAULT 0,
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  guild_id uuid NOT NULL REFERENCES guilds (id) ON DELETE CASCADE,
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE guild_role_channels (
  role_id uuid NOT NULL REFERENCES guild_roles (id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES channels (id) ON DELETE CASCADE,
  PRIMARY KEY(role_id, channel_id)
);
CREATE UNIQUE INDEX ON guild_role_channels (channel_id, role_id);

CREATE TABLE channel_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7 (),
  content varchar(2000) NOT NULL DEFAULT '',
  is_pinned boolean NOT NULL DEFAULT FALSE,
  flags int NOT NULL DEFAULT 1,
  user_id uuid NOT NULL REFERENCES users (id),
  channel_id uuid NOT NULL REFERENCES channels (id) ON DELETE CASCADE,
  guild_id uuid REFERENCES guilds (id) ON DELETE CASCADE,
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone
);

CREATE TABLE attachments (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v7 (),
  resource_type varchar(128) NOT NULL,
  signature text NOT NULL,
  unix_timestamp bigint NOT NULL,
  attached_by_id uuid NOT NULL REFERENCES users(id),
  height int NOT NULL,
  width int NOT NULL,
  filesize int NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE channel_message_attachments (
  channel_message_id uuid NOT NULL REFERENCES channel_messages (id) ON DELETE CASCADE,
  attachment_id uuid NOT NULL REFERENCES attachments (id) ON DELETE CASCADE,
  PRIMARY KEY (channel_message_id, attachment_id)
);
CREATE UNIQUE INDEX ON channel_message_attachments (attachment_id, channel_message_id);

CREATE TABLE guild_attachments (
  usage_type int NOT NULL DEFAULT 0, -- 0: Icon | 1: Banner
  guild_id uuid NOT NULL REFERENCES guilds (id) ON DELETE CASCADE,
  attachment_id uuid NOT NULL REFERENCES attachments (id) ON DELETE CASCADE,
  PRIMARY KEY (guild_id, attachment_id)
);
CREATE UNIQUE INDEX ON guild_attachments (attachment_id, guild_id);
CREATE INDEX guild_attachments_idx_usage_type_guild_id ON guild_attachments (usage_type,guild_id);


CREATE TABLE user_attachments (
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  attachment_id uuid NOT NULL REFERENCES attachments (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, attachment_id)
);
CREATE UNIQUE INDEX ON user_attachments (attachment_id, user_id);


