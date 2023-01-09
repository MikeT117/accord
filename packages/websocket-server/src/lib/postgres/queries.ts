import {
  Guild,
  GuildRole,
  UserAccount,
  GuildMember,
  GuildRoleGuildMember,
  VoiceChannelState,
  PrivateChannel,
  GuildChannel,
} from '@accord/common';
import { sql } from './client';

export const getClientInititialisationPayload = async ({ userId }: { userId: string }) => {
  return sql.begin(async (tx) => {
    const guilds = await tx<Guild[]>`
      SELECT
        g.*,
        a_1.src as icon,
        a_2.src as banner
      FROM
        guild g
      INNER JOIN
        guild_member gm ON gm.guild_id = g.id
      LEFT JOIN
        guild_attachments ga_1 ON ga_1.guild_id = g.id AND ga_1.type = 0
      LEFT JOIN
        guild_attachments ga_2 ON ga_2.guild_id = g.id AND ga_2.type = 1
      LEFT JOIN
        attachment a_1 ON a_1.id = ga_1.attachment_id
      LEFT JOIN
        attachment a_2 ON a_2.id = ga_2.attachment_id
      WHERE
        gm.user_account_id = ${userId}
      AND NOT
        gm.is_banned;
    `;

    const guildIds = guilds.map((g) => g.id);

    const guildRoles = await tx<GuildRole[]>`
      SELECT
        *
      FROM
        guild_role
      WHERE
        guild_id = ANY(${guildIds}::uuid[])
    `;

    const guildMember = await tx<GuildMember[]>`
      SELECT
        gm.*,
        JSON_BUILD_OBJECT(
          'id', ua.id,
          'displayName', ua.display_name,
          'avatar', a.src
        ) as user,
        ARRAY_AGG(grgm.guild_role_id) as roles
      FROM
        guild_member gm
      INNER JOIN
        user_account ua ON gm.user_account_id = ua.id
      INNER JOIN
        guild_role_guild_members grgm ON grgm.guild_member_id = gm.id
      LEFT JOIN
        user_account_attachments uat ON uat.user_account_id = ua.id
      LEFT JOIN
        attachment a ON a.id = uat.attachment_id
      WHERE
        gm.user_account_id = ${userId}
      AND NOT
        gm.is_banned
      GROUP BY
        gm.id, ua.id, a.src;
    `;

    const guildChannels = await tx<GuildChannel[]>`
      SELECT
        c.*,
        COALESCE(ARRAY_AGG(grc.guild_role_id) FILTER (WHERE grc.guild_role_id IS NOT null), '{}') AS roles
      FROM
        channel c
      LEFT JOIN
        guild_role_channels grc ON grc.channel_id = c.id
      WHERE
        c.guild_id = ANY(${guildIds}::uuid[])
      GROUP BY
        c.id
    `;

    const [user] = await tx<UserAccount[]>`
      SELECT
        ua.*,
        a.src as avatar
      FROM
        user_account ua
      LEFT JOIN
        user_account_attachments uat ON uat.user_account_id = ua.id
      LEFT JOIN
        attachment a ON a.id = uat.attachment_id
      WHERE
        ua.id = ${userId};
    `;

    const privateChannels = await tx<PrivateChannel[]>`
      WITH CHANNELS_CTE as (
        SELECT
          c.*
        FROM
          channel c
        INNER JOIN
          channel_user_accounts cm on c.id = cm.channel_id
        WHERE
          type = ANY('{2, 3}'::Int[])
        AND
          cm.user_account_id = ${userId}
      ),

      CHANNEL_MEMBERS_CTE AS (
        SELECT
        cua.channel_id,
        COALESCE(
          ARRAY_AGG(
            JSON_BUILD_OBJECT(
              'id', ua.id,
              'displayName', ua.display_name,
              'avatar', a.src
              )
            ) 
            FILTER (WHERE ua.id IS NOT null),
            '{}'
          ) AS members
        FROM
          channel_user_accounts cua
        INNER JOIN
          user_account ua ON ua.id = cua.user_account_id
        LEFT JOIN
          user_account_attachments uat ON uat.user_account_id = ua.id
        LEFT JOIN
          attachment a ON a.id = uat.attachment_id
        WHERE
          channel_id in (
            SELECT
              id
            FROM
              CHANNELS_CTE
          )
        GROUP BY
          cua.channel_id
      )

      SELECT
        ccte.*,
        cmcte.members
      FROM
        CHANNELS_CTE ccte
      INNER JOIN
        CHANNEL_MEMBERS_CTE cmcte on cmcte.channel_id = ccte.id
    `;

    const guildRoleGuildMembers = await sql<Pick<GuildRoleGuildMember, 'guildRoleId'>[]>`
      SELECT
        grgm.guild_role_id
      FROM
        guild_role_guild_members grgm
      INNER JOIN
        guild_member gm on grgm.guild_member_id = gm.id
      WHERE
        gm.user_account_id = ${userId}
      AND NOT
        gm.is_banned;
    `;

    const voiceChannelStates = await sql<VoiceChannelState[]>`
    WITH VOICE_CHANNEL_STATES_CTE AS (
      SELECT
        *
      FROM
        voice_channel_state
      WHERE
        guild_id = ANY(${guildIds}::uuid[])
    ),

    VOICE_CHANNEL_GUILD_MEMBERS_CTE AS (
      SELECT
        gm.guild_id,
        gm.user_account_id,
        JSON_BUILD_OBJECT(
          'id', gm.id,
          'nickname', gm.nickname,
          'user', JSON_BUILD_OBJECT(
            'id', ua.id,
            'displayName', ua.display_name,
            'avatar', a.src
          )
        ) as member
      FROM
        guild_member gm 
      INNER JOIN
        user_account ua ON ua.id = gm.user_account_id
      LEFT JOIN
        user_account_attachments uaa ON uaa.user_account_id = ua.id
      LEFT JOIN
        attachment a ON a.id = uaa.attachment_id
      WHERE
        gm.guild_id = ANY(${guildIds}::uuid[])
      AND
        gm.user_account_id = ANY(
          SELECT
            user_account_id
          FROM
            VOICE_CHANNEL_STATES_CTE
        )
    )
      SELECT
        vcs.*,
        vcgm.member
      FROM
        VOICE_CHANNEL_STATES_CTE vcs
      INNER JOIN
        VOICE_CHANNEL_GUILD_MEMBERS_CTE vcgm ON
          vcgm.user_account_id = vcs.user_account_id
        AND
          vcgm.guild_id = vcs.guild_id;
    `;

    return {
      guilds: guilds.map((g) => ({
        ...g,
        roles: guildRoles.filter((r) => r.guildId === g.id),
        member: guildMember.find((gm) => gm.guildId === g.id),
      })),
      guildChannels,
      voiceChannelStates,
      privateChannels,
      user,
      subscribeToRoles: guildRoleGuildMembers.map((r) => r.guildRoleId),
    };
  });
};
