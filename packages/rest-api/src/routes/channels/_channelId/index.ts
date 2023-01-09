import type { Channel, Guild, GuildChannel } from '@accord/common';
import { AccordOperation } from '@accord/common';
import { FastifyPluginAsync } from 'fastify';
import { AccordAPIError } from '../../../lib/AccordAPIError';

const channels: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.patch<{
    Body:
      | { name: string; topic?: string; parentId?: undefined }
      | { name: undefined; topic?: undefined; parentId: string | null };
    Params: { channelId: string };
  }>(
    '/',
    {
      config: {
        requireGuildChannelPermission: 'guild_admin',
      },
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            channelId: {
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['channelId'],
        },
        body: {
          oneOf: [
            {
              type: 'object',
              properties: {
                name: { type: 'string' },
                topic: { type: 'string', nullable: true },
              },
              required: ['name'],
            },
            {
              type: 'object',
              properties: {
                parentId: { type: 'string', nullable: true },
              },
              required: ['parentId'],
            },
          ],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              channel: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  guildId: { type: 'string', nullable: true },
                  parentId: { type: 'string', nullable: true },
                  parentRoleSync: { type: 'boolean' },
                  type: { type: 'number' },
                  name: { type: 'string' },
                  topic: { type: 'string', nullable: true },
                },
              },
            },
          },
          404: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { channelId } = request.params;
      const { userId } = request;

      const updatePayload = request.body.parentId
        ? { ...request.body, parentRoleSync: false }
        : { ...request.body };

      const [channel] = await this.sql<
        Pick<
          GuildChannel,
          'id' | 'name' | 'topic' | 'type' | 'parentId' | 'parentRoleSync' | 'guildId'
        >[]
      >`
        UPDATE 
          channel
        SET
          ${this.sql(updatePayload)}
        WHERE
          id = ${channelId}
        AND
          guild_id IS NOT NULL
        RETURNING
          id,
          guild_id,
          parent_id,
          parent_role_sync,
          type,
          name,
          topic;
        `;

      if (!channel || !channel.guildId) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'CHANNEL_NOT_FOUND' });
      }

      const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(
        channel.guildId,
      );

      fastify.amqpUtils.sendToChannelQueue({
        op: AccordOperation.CHANNEL_UPDATE_OP,
        d: { channel },
        publishToRoleIds: [defaultRoleId],
        excludedUserIds: [userId],
      });

      return { channel };
    },
  );

  fastify.delete<{ Params: { channelId: string } }>(
    '/',
    {
      config: {
        requireGuildChannelPermission: 'guild_admin',
        requireChannelMember: true,
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
      const { channelId } = request.params;
      const { userId } = request;

      const [channel] = await this.sql<Pick<GuildChannel, 'id' | 'type' | 'guildId'>[]>`
        SELECT
          id,
          type,
          guild_id
        FROM
          channel
        WHERE
          id = ${channelId}
        AND
          type = ANY('{0,1,4}'::int[]);
      `;

      if (!channel) {
        throw new AccordAPIError({ clientMessage: 'CHANNEL_NOT_FOUND', statusCode: 404 });
      }

      const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(
        channel.guildId,
      );

      return this.sql.begin(async (tx) => {
        if (channel.type === 1) {
          const channels = await tx<Pick<GuildChannel, 'id'>[]>`
            UPDATE
              channel
            SET
              parent_role_sync = false,
              parent_id = null
            WHERE
              parent_id = ${channelId}
            AND
              type = ANY('{0,1,4}'::int[])
            RETURNING
              id,
              guild_id,
              type;
          `;

          if (channels.length !== 0) {
            for (const c of channels) {
              this.amqpUtils.sendToChannelQueue({
                op: AccordOperation.CHANNEL_UPDATE_OP,
                d: { channel: { ...c, parentRoleSync: false, parentId: null } },
                publishToRoleIds: [defaultRoleId],
              });
            }
          }
        }

        await tx<Pick<Channel, 'id' | 'guildId' | 'type'>[]>`
          DELETE FROM
            channel
          WHERE
            id = ${channelId}
          RETURNING
            id,
            guild_id;
        `;

        const [guild] = await tx<Pick<Guild, 'id' | 'channelCount'>[]>`
          UPDATE 
            guild
          SET
            channel_count = channel_count - 1
          WHERE
            id = ${channel.guildId}
          RETURNING
            id,
            channel_count;
        `;

        this.amqpUtils.sendToGuildQueue({
          op: AccordOperation.GUILD_UPDATE_OP,
          d: { guild },
          publishToRoleIds: [defaultRoleId],
        });

        this.amqpUtils.sendToChannelQueue({
          op: AccordOperation.CHANNEL_DELETE_OP,
          d: { channel },
          publishToRoleIds: [defaultRoleId],
          excludedUserIds: [userId],
        });

        reply.statusCode = 204;
      });
    },
  );
};

export default channels;
