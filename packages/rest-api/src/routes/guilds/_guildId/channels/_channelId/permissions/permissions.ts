import type { FastifyPluginAsync } from 'fastify';
import { AccordOperation } from '@accord/common';
import type { GuildChannel, GuildRoleChannel } from '@accord/common';
import { AccordAPIError } from '../../../../../../lib/AccordAPIError';

const guildChannelPermissions: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.post<{ Params: { guildId: string; channelId: string } }>(
    '/sync',
    {
      config: {
        requireGuildChannelPermission: 'guild_admin',
      },
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            channelId: { type: 'string', format: 'uuid' },
          },
          required: ['channelId'],
        },
        response: {
          204: {},
          404: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { channelId, guildId } = request.params;

      return this.sql.begin(async (tx) => {
        const [channel] = await tx<
          Pick<GuildChannel, 'id' | 'type' | 'parentId' | 'parentRoleSync'>[]
        >`
          UPDATE
            channel
          SET
            parent_role_sync = true
          WHERE
            id = ${channelId}
          AND
            type = ANY('{0, 4}'::INT[])
          AND
            guild_id = ${guildId}
          AND
            parent_id IS NOT NULL
          RETURNING
            id,
            type,
            guild_id,
            parent_role_sync,
            parent_id
        `;

        if (!channel || !channel.parentId) {
          throw new AccordAPIError({ clientMessage: 'CHANNEL_NOT_FOUND', statusCode: 404 });
        }

        await tx`
          DELETE FROM
            guild_role_channels
          WHERE
            channel_id = ${channelId};
        `;

        const roles = await tx<Pick<GuildRoleChannel, 'guildRoleId'>[]>`
          INSERT INTO guild_role_channels
            (guild_role_id, channel_id)
          SELECT
            guild_role_id,
            ${channelId}
          FROM
            guild_role_channels
          WHERE
            channel_id = ${channel.parentId}
          RETURNING
            guild_role_id;
        `;

        const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

        fastify.amqpUtils.sendToChannelQueue({
          op: AccordOperation.CHANNEL_UPDATE_OP,
          d: {
            channel: { ...channel, roles: roles.map((r) => r.guildRoleId) },
          },
          publishToRoleIds: [defaultRoleId],
        });

        reply.statusCode = 204;
      });
    },
  );
};

export default guildChannelPermissions;
