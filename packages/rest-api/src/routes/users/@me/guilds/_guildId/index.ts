import type { Guild, GuildMember } from '@accord/common';
import { AccordOperation } from '@accord/common';
import { FastifyPluginAsync } from 'fastify';
import { AccordAPIError } from '../../../../../lib/AccordAPIError';

const userGuilds: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.delete<{ Params: { guildId: string } }>(
    '/',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            guildId: { type: 'string', format: 'uuid' },
          },
          required: ['guildId'],
        },
        response: {
          204: {},
          400: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { userId } = request;
      const { guildId } = request.params;

      const [member] = await this.sql<Pick<GuildMember, 'id'>[]>`
        SELECT
          id
        FROM
          guild_member
        WHERE
          guild_id = ${guildId}
        AND
          user_account_id = ${userId};
      `;

      if (!member) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'MEMBER_NOT_FOUND' });
      }

      const roleIds = await this.publishUtils.selectGuildRolesByMemberId(guildId, member.id);

      const guild = await this.sql.begin(async (tx) => {
        await tx<Pick<GuildMember, 'userAccountId'>[]>`
          DELETE FROM
            guild_member
          WHERE
            guild_id = ${guildId}
          AND
            user_account_id = ${userId}
          RETURNING
            user_account_id;
        `;

        const [guild] = await tx<Pick<Guild, 'id' | 'memberCount'>[]>`
          UPDATE 
            guild
          SET
            member_count = member_count - 1
          WHERE
            id = ${guildId}
          RETURNING
            id,
            member_count;
        `;

        return guild;
      });

      const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

      this.amqpUtils.sendToGuildQueue({
        op: AccordOperation.GUILD_UPDATE_OP,
        d: { guild },
        publishToRoleIds: [defaultRoleId],
      });

      this.amqpUtils.sendToGuildQueue({
        op: AccordOperation.GUILD_DELETE_OP,
        d: { guild: { id: guildId } },
        publishToUserIds: [userId],
      });

      this.amqpUtils.sendToSocketSessionQueue({
        op: AccordOperation.SOCKET_SUBSCRIPTION_REMOVE,
        d: { roleIds, userIds: [userId] },
      });
    },
  );
};
export default userGuilds;
