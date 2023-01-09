import type { FastifyPluginAsync } from 'fastify';
import { AccordOperation } from '@accord/common';
import type { GuildRole } from '@accord/common';
import { AccordAPIError } from '../../../../lib/AccordAPIError';

const guildRoles: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{ Params: { guildId: string } }>(
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
          },
          required: ['guildId'],
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                guildId: { type: 'string' },
                viewGuildChannel: { type: 'boolean' },
                manageGuildChannels: { type: 'boolean' },
                createChannelMessage: { type: 'boolean' },
                manageChannelMessages: { type: 'boolean' },
                manageGuild: { type: 'boolean' },
                guildAdmin: { type: 'boolean' },
              },
            },
          },
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { guildId } = request.params;
      return this.sql<GuildRole[]>`
        SELECT
          *
        FROM
          guild_role
        WHERE
          guild_id = ${guildId};
      `;
    },
  );

  fastify.patch<{
    Params: { guildId: string; roleId: string };
    Body: Partial<Omit<GuildRole, 'id' | 'guildId'>>;
  }>(
    '/:roleId',
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
          },
          required: ['guildId', 'roleId'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            guildId: { type: 'string' },
            viewGuildChannel: { type: 'boolean' },
            manageGuildChannels: { type: 'boolean' },
            createChannelMessage: { type: 'boolean' },
            manageChannelMessages: { type: 'boolean' },
            manageGuild: { type: 'boolean' },
            guildAdmin: { type: 'boolean' },
          },
          required: [
            'name',
            'viewGuildChannel',
            'manageGuildChannels',
            'createChannelMessage',
            'manageChannelMessages',
            'manageGuild',
            'guildAdmin',
          ],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              role: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  guildId: { type: 'string' },
                  viewGuildChannel: { type: 'boolean' },
                  manageGuildChannels: { type: 'boolean' },
                  createChannelMessage: { type: 'boolean' },
                  manageChannelMessages: { type: 'boolean' },
                  manageGuild: { type: 'boolean' },
                  guildAdmin: { type: 'boolean' },
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
      const { guildId, roleId } = request.params;
      const { userId } = request;

      const [role] = await this.sql<GuildRole[]>`
        UPDATE
          guild_role
        SET
          ${this.sql(request.body)}
        WHERE
          id = ${roleId}
        AND
          guild_id = ${guildId}
        RETURNING
          *;
      `;

      if (!role) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'ROLE_NOT_FOUND' });
      }

      const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

      fastify.amqpUtils.sendToGuildRoleQueue({
        op: AccordOperation.GUILD_ROLE_UPDATE_OP,
        publishToRoleIds: [defaultRoleId],
        d: { role },
        excludedUserIds: [userId],
      });

      return { role };
    },
  );

  fastify.post<{
    Params: { guildId: string };
    Body: {
      name: string;
    };
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
          },
          required: ['guildId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              role: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  guildId: { type: 'string' },
                  viewGuildChannel: { type: 'boolean' },
                  manageGuildChannels: { type: 'boolean' },
                  createChannelMessage: { type: 'boolean' },
                  manageChannelMessages: { type: 'boolean' },
                  manageGuild: { type: 'boolean' },
                  guildAdmin: { type: 'boolean' },
                },
              },
            },
          },
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { userId } = request;
      const { guildId } = request.params;

      const [role] = await this.sql<GuildRole[]>`
        INSERT INTO guild_role
          (name, guild_id)
        VALUES
          ('New-Role', ${guildId})
        RETURNING
          *;
      `;

      const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

      fastify.amqpUtils.sendToGuildRoleQueue({
        op: AccordOperation.GUILD_ROLE_CREATE_OP,
        publishToRoleIds: [defaultRoleId],
        d: { role },
        excludedUserIds: [userId],
      });

      return { role };
    },
  );

  fastify.delete<{
    Params: { guildId: string; roleId: string };
  }>(
    '/:roleId',
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
          },
          required: ['guildId', 'roleId'],
        },
        response: {
          204: {},
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { guildId, roleId } = request.params;
      const { userId } = request;

      const { count } = await this.sql`
        DELETE FROM
          guild_role
        WHERE
          id = ${roleId}
        AND
          guild_id = ${guildId};
      `;

      if (count !== 1) {
        throw new AccordAPIError({ clientMessage: 'ROLE_NOT_FOUND', statusCode: 404 });
      }

      const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

      fastify.amqpUtils.sendToGuildRoleQueue({
        op: AccordOperation.GUILD_ROLE_DELETE_OP,
        publishToRoleIds: [defaultRoleId],
        d: { role: { id: roleId, guildId } },
        excludedUserIds: [userId],
      });

      reply.statusCode = 204;
    },
  );
};

export default guildRoles;
