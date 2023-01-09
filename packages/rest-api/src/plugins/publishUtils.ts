import fp from 'fastify-plugin';
import type { GuildRole } from '@accord/common';

export default fp(async (fastify) => {
  async function selectDefaultGuildRoleByGuildId(guildId: string) {
    const [guildRole] = await fastify.sql<Pick<GuildRole, 'id'>[]>`
      SELECT
        id
      FROM
        guild_role
      where
        guild_id = ${guildId}
      AND
        name = '@default';
    `;

    return guildRole.id;
  }

  async function selectGuildRolesByChannelId(channelId: string) {
    const [guildRoles] = await fastify.sql<{ ids: string[] }[]>`
      SELECT
        array_agg(gr.id) as ids
      FROM
        guild_role gr
      INNER JOIN
        guild_role_channels grc ON grc.guild_role_id = gr.id
      WHERE
        view_guild_channel
      AND
        channel_id = ${channelId};
    `;

    return guildRoles.ids ?? [];
  }

  async function selectGuildRolesByMemberId(guildId: string, memberId: string) {
    const [guildRoles] = await fastify.sql<{ ids: string[] }[]>`
      SELECT
        array_agg(gr.id) as ids
      FROM
        guild_role gr
      INNER JOIN
        guild_role_guild_members grgm ON grgm.guild_role_id = gr.id
      WHERE
      grgm.guild_member_id = ${memberId}
      AND
        gr.guild_id = ${guildId}
    `;

    return guildRoles.ids ?? [];
  }

  async function selectChannelMembersByChannelId(channelId: string) {
    const [channelMembers] = await fastify.sql<{ ids: string[] }[]>`
      SELECT
        array_agg(user_account_id) as ids
      FROM
        channel_user_accounts
      WHERE
        channel_id = ${channelId};
    `;

    return channelMembers.ids ?? [];
  }

  fastify.decorate('publishUtils', {
    selectGuildRolesByMemberId,
    selectDefaultGuildRoleByGuildId,
    selectGuildRolesByChannelId,
    selectChannelMembersByChannelId,
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    publishUtils: {
      selectGuildRolesByMemberId: (guildId: string, memberId: string) => Promise<string[]>;
      selectDefaultGuildRoleByGuildId: (guildId: string) => Promise<string>;
      selectGuildRolesByChannelId(channelId: string): Promise<string[]>;
      selectChannelMembersByChannelId(channelId: string): Promise<string[]>;
    };
  }
}
