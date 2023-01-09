import type { FastifyPluginAsync } from 'fastify';
import { AccordOperation, GuildChannel } from '@accord/common';
import type { GuildRoleChannel } from '@accord/common';
import { AccordAPIError } from '../../../../../../../lib/AccordAPIError';

const guildRoleChannels: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.put<{
    Params: { guildId: string; roleId: string; channelId: string };
  }>(
    '/',
    {
      config: {
        requireGuildPermission: 'guild_admin',
      },
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            guildId: {
              type: 'string',
              format: 'uuid',
            },
            roleId: {
              type: 'string',
              format: 'uuid',
            },
            channelId: {
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['guildId', 'roleId', 'channelId'],
        },
        response: {
          204: {},
          404: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { guildId, roleId, channelId } = request.params;

      return this.sql.begin(async (tx) => {
        const [channel] = await tx<Pick<GuildChannel, 'id' | 'type'>[]>`
          UPDATE
            channel
          SET
            parent_role_sync = false
          WHERE
            id = ${channelId}
          AND
            guild_id IS NOT NULL
          RETURNING
            id,
            parent_role_sync,
            type,
            guild_id;
        `;

        if (!channel) {
          throw new AccordAPIError({ statusCode: 404, clientMessage: 'CHANNEL_NOT_FOUND' });
        }

        await tx`
          INSERT INTO guild_role_channels
            (guild_role_id, channel_id)
          SELECT
            gr.id,
            c.id
          FROM
            guild_role gr
          INNER JOIN
            channel c ON c.id = ${channelId}
          WHERE
            gr.id = ${roleId};
        `;

        if (channel.type === 1) {
          const childChannels = await tx<Pick<GuildChannel, 'id' | 'type'>[]>`
            SELECT
              id,
              type,
              guild_id,
              parent_role_sync
            FROM
              channel
            WHERE
              parent_id = ${channelId}
            AND
              parent_role_sync;
          `;

          const [parentChannelRoles] = await tx<{ ids: string[] }[]>`
            SELECT
              ARRAY_AGG(guild_role_id) as ids
            FROM
              guild_role_channels
            WHERE
              channel_id = ${channelId};
          `;

          await tx`
            DELETE FROM
              guild_role_channels
            WHERE
              channel_id = ANY(${childChannels.map((c) => c.id)}::uuid[]);
            `;

          await tx`
            INSERT INTO guild_role_channels
              (channel_id, guild_role_id)
            SELECT
              id,
              UNNEST(${parentChannelRoles.ids}::uuid[])
            FROM
              channel
            WHERE
              id = ANY(${childChannels.map((c) => c.id)}::uuid[]);
          `;

          const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

          for (const c of [...childChannels, channel]) {
            fastify.amqpUtils.sendToChannelQueue({
              op: AccordOperation.CHANNEL_UPDATE_OP,
              d: { channel: { ...c, roles: parentChannelRoles.ids } },
              publishToRoleIds: [defaultRoleId],
            });
          }
        } else {
          const [parentChannelRoles] = await tx<{ ids: string[] }[]>`
            SELECT
              ARRAY_AGG(guild_role_id) as ids
            FROM
              guild_role_channels
            WHERE
              channel_id = ${channelId};
          `;

          const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

          fastify.amqpUtils.sendToChannelQueue({
            op: AccordOperation.CHANNEL_UPDATE_OP,
            d: { channel: { ...channel, roles: parentChannelRoles.ids } },
            publishToRoleIds: [defaultRoleId],
          });
        }

        reply.statusCode = 204;
      });
    },
  );

  fastify.delete<{
    Params: { guildId: string; roleId: string; channelId: string };
  }>(
    '/',
    {
      config: {
        requireGuildPermission: 'guild_admin',
      },
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            guildId: {
              type: 'string',
              format: 'uuid',
            },
            roleId: {
              type: 'string',
              format: 'uuid',
            },
            channelId: {
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['guildId', 'roleId', 'channelId'],
        },
        response: {
          204: {},
          404: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { guildId, roleId, channelId } = request.params;

      return this.sql.begin(async (tx) => {
        const [channel] = await tx<Pick<GuildChannel, 'id' | 'type'>[]>`
          UPDATE
            channel
          SET
            parent_role_sync = false
          WHERE
            id = ${channelId}
          RETURNING
            id,
            type,
            guild_id,
            parent_role_sync;
        `;

        if (!channel) {
          throw new AccordAPIError({ statusCode: 404, clientMessage: 'CHANNEL_NOT_FOUND' });
        }

        await tx`
          DELETE FROM
            guild_role_channels
          WHERE
            channel_id = ${channelId}
          AND
            guild_role_id = ${roleId};
        `;

        if (channel.type === 1) {
          const childChannels = await tx<Pick<GuildChannel, 'id' | 'type'>[]>`
            SELECT
              id,
              type,
              guild_id,
              parent_role_sync
            FROM
              channel
            WHERE
              parent_id = ${channelId}
            AND
              guild_id IS NOT NULL
            AND
              parent_role_sync;
          `;

          await tx`
            DELETE FROM
              guild_role_channels
            WHERE
              channel_id = ANY(${childChannels.map((c) => c.id)}::uuid[]);
            `;

          const roles = await tx<Pick<GuildRoleChannel, 'guildRoleId'>[]>`
            INSERT INTO guild_role_channels
              (guild_role_id, channel_id)
            SELECT
              guild_role_id,
              UNNEST(${childChannels.map((c) => c.id)}::uuid[])
            FROM
              guild_role_channels
            WHERE
              channel_id = ${channelId}
            RETURNING
              guild_role_id;
          `;

          const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

          for (const c of [...childChannels, channel]) {
            fastify.amqpUtils.sendToChannelQueue({
              op: AccordOperation.CHANNEL_UPDATE_OP,
              d: { channel: { ...c, roles: roles.map((r) => r.guildRoleId) } },
              publishToRoleIds: [defaultRoleId],
            });
          }
        } else {
          const [parentChannelRoles] = await tx<{ ids: string[] }[]>`
            SELECT
              ARRAY_AGG(guild_role_id) as ids
            FROM
              guild_role_channels
            WHERE
              channel_id = ${channelId};
          `;

          const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

          fastify.amqpUtils.sendToChannelQueue({
            op: AccordOperation.CHANNEL_UPDATE_OP,
            d: { channel: { ...channel, roles: parentChannelRoles.ids } },
            publishToRoleIds: [defaultRoleId],
          });
        }

        reply.statusCode = 204;
      });
    },
  );
};

export default guildRoleChannels;
