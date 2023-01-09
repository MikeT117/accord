import { AccordOperation } from '@accord/common';
import type { Channel, GuildRoleChannel, Guild } from '@accord/common';
import { FastifyPluginAsync } from 'fastify';

const guildChannels: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.post<{
    Body: {
      name: string;
      topic: string | null;
      roles?: string[];
      type: 0 | 1 | 4;
      isPrivate: boolean;
    };
    Params: { guildId: string };
  }>(
    '/',
    {
      config: {
        requireGuildPermission: 'manage_guild_channels',
      },
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            guildId: { type: 'string', format: 'uuid' },
          },
          required: ['guildId'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            topic: { type: 'string', default: null },
            isPrivate: { type: 'boolean', default: true },
            roles: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
            },
            type: { type: 'number', enum: [0, 1, 4] },
          },
          required: ['name', 'type'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              channel: {
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  topic: { type: 'string', nullable: true },
                  type: { type: 'number' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  parentId: { type: 'string', nullable: true },
                  guildId: { type: 'string' },
                  parentRoleSync: { type: 'boolean' },
                  roles: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { guildId } = request.params;
      const { name, topic, roles, type, isPrivate } = request.body;
      const { userId } = request;

      return this.sql.begin(async (tx) => {
        const [channel] = await tx<
          (Omit<Channel, 'type' | 'guildId'> & {
            guildId: string;
            type: 0 | 1 | 4;
            roles: string[];
          })[]
        >`
          INSERT INTO channel
            (name, guild_id, topic, type)
          VALUES
            (${name}, ${guildId}, ${topic}, ${type})
          RETURNING
            *;
        `;

        const guildRoleChannels = await tx<Pick<GuildRoleChannel, 'guildRoleId'>[]>`
          INSERT INTO guild_role_channels
            (guild_role_id, channel_id)
          SELECT
            gr.id,
            ${channel.id}
          FROM
            guild_role gr
          WHERE
            (
              ${
                isPrivate
                  ? this.sql`gr.id = ANY(${roles ?? []}::uuid[])`
                  : this.sql`gr.name = '@default'`
              }
          OR
            gr.name = '@owner'
            )
          AND
            gr.guild_id = ${guildId}
          RETURNING
            guild_role_id
        `;

        const [guild] = await tx<Pick<Guild, 'id' | 'channelCount'>[]>`
          UPDATE
            guild
          SET
            channel_count = channel_count + 1
          WHERE
            id = ${guildId}
          RETURNING
            id,
            channel_count;
        `;

        const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

        fastify.amqpUtils.sendToGuildQueue({
          op: AccordOperation.GUILD_UPDATE_OP,
          d: { guild },
          publishToRoleIds: [defaultRoleId],
        });

        fastify.amqpUtils.sendToChannelQueue({
          op: AccordOperation.CHANNEL_CREATE_OP,
          d: {
            channel: {
              ...channel,
              roles: guildRoleChannels.map((r) => r.guildRoleId),
            },
          },
          publishToRoleIds: [defaultRoleId],
          excludedUserIds: [userId],
        });

        return {
          channel: {
            ...channel,
            roles: guildRoleChannels.map((r) => r.guildRoleId),
          },
        };
      });
    },
  );
};
export default guildChannels;
