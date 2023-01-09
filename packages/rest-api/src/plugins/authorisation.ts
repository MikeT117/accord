import type { GuildRole, RolePermissionSnakeCase } from '@accord/common';
import type { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { AccordAPIError } from '../lib/AccordAPIError';

export default fp(async (fastify) => {
  fastify.addHook(
    'onRequest',
    async (
      request: FastifyRequest<{
        Params: { guildId?: string; channelId?: string };
      }>,
    ) => {
      const { guildId, channelId } = request.params;
      const { userId } = request;
      const {
        requireGuildChannelPermission,
        requireGuildPermission,
        requireChannelMember,
        requireGuildMember,
      } = request.routeConfig;

      if (
        typeof requireGuildChannelPermission === 'undefined' &&
        typeof requireGuildPermission === 'undefined' &&
        typeof requireChannelMember === 'undefined' &&
        typeof requireGuildMember === 'undefined'
      ) {
        return;
      }

      if (guildId && requireGuildPermission) {
        const { count } = await fastify.sql`
          SELECT
            gr.id
          FROM
            guild_role_guild_members grgm
          INNER JOIN
            guild_role gr on gr.id = grgm.guild_role_id
          INNER JOIN
            guild_member gm on gm.id = grgm.guild_member_id
          WHERE
            gm.user_account_id = ${userId}
          AND
            gr.guild_id = ${guildId}
          AND
            gr.${fastify.sql(requireGuildPermission)}
          AND NOT
            gm.is_banned
          LIMIT
            1;
          `;

        if (count !== 0) {
          return;
        }
      }

      if (guildId && requireGuildMember) {
        const { count } = await fastify.sql`
          SELECT
            id
          FROM
            guild_member
          WHERE
            user_account_id = ${userId}
          AND
            guild_id = ${guildId}
          AND NOT
            is_banned
          LIMIT
            1;
        `;

        if (count !== 0) {
          return;
        }
      }

      if (channelId && requireGuildChannelPermission) {
        const { count } = await fastify.sql<Pick<GuildRole, 'guildId'>[]>`
          SELECT
            grgm.guild_role_id
          FROM
            guild_role_guild_members grgm
          INNER JOIN
            guild_member gm on gm.id = grgm.guild_member_id
          INNER JOIN
            guild_role_channels grc on grc.guild_role_id = grgm.guild_role_id
          INNER JOIN
            guild_role gr on gr.id = grc.guild_role_id
          WHERE
            grc.channel_id = ${channelId}
          AND 
            gm.user_account_id = ${userId}
          AND
            gr.${fastify.sql(requireGuildChannelPermission)}
          AND NOT
            gm.is_banned
          LIMIT
            1;
          `;

        if (count !== 0) {
          return;
        }
      }

      if (channelId && requireChannelMember) {
        const { count } = await fastify.sql`
          SELECT
            user_account_id
          FROM
            channel_user_accounts
          WHERE
            channel_id = ${channelId}
          AND
            user_account_id = ${userId}
          LIMIT
            1;
          `;

        if (count !== 0) {
          return;
        }
      }

      throw new AccordAPIError({ statusCode: 401, clientMessage: 'ACCESS_DENIED' });
    },
  );
});

declare module 'fastify' {
  export interface FastifyContextConfig {
    requireGuildPermission?: RolePermissionSnakeCase;
    requireGuildChannelPermission?: RolePermissionSnakeCase;
    requireGuildMember?: boolean;
    requireChannelMember?: boolean;
  }
}
