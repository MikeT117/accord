import { GuildInvite } from '@accord/common';
import type { FastifyPluginAsync } from 'fastify';
import { AccordAPIError } from '../../../../lib/AccordAPIError';

const guildInvites: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{ Params: { guildId: string }; Querystring: { offset: number; limit: number } }>(
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
            guildId: { type: 'string', format: 'uuid' },
          },
          required: ['guildId'],
        },
        querystring: {
          type: 'object',
          properties: {
            offset: { type: 'number', default: 0 },
            limit: { type: 'number', default: 50, enum: [50] },
          },
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                status: { type: 'number' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                usedCount: { type: 'number' },
                guildMemberId: { type: 'string' },
                guildId: { type: 'string' },
                creator: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    nickname: { type: 'string', nullable: true },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        displayName: { type: 'string' },
                        avatar: { type: 'string', nullable: true },
                      },
                    },
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
      const { limit, offset } = request.query;

      return this.sql<GuildInvite[]>`
        SELECT
          gi.*,
          JSON_BUILD_OBJECT(
            'id', gm.id,
            'nickname', gm.nickname,
            'user', JSON_BUILD_OBJECT(
              'id', ua.id,
              'displayName', ua.display_name,
              'avatar', a.src
            )
          ) as creator
        FROM
          guild_invite gi
        INNER JOIN
          guild_member gm ON gm.id = gi.guild_member_id
        INNER JOIN
          user_account ua ON ua.id = gm.user_account_id
        LEFT JOIN
          user_account_attachments uat ON uat.user_account_id = ua.id
        LEFT JOIN
          attachment a ON a.id = uat.attachment_id
        WHERE
          gi.guild_id = ${guildId}
        OFFSET ${offset}
        LIMIT ${limit};
      `;
    },
  );

  fastify.post<{ Params: { guildId: string }; Body: { expiresIn?: string } }>(
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
              invite: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
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

      const [invite] = await this.sql<Pick<GuildInvite, 'id'>[]>`
        INSERT INTO guild_invite
          (guild_member_id, guild_id)
        SELECT
          id,
          guild_id
        FROM
          guild_member
        WHERE
          user_account_id = ${userId}
        AND
          guild_id = ${guildId}
        RETURNING
          id;
      `;

      return { invite };
    },
  );

  fastify.delete<{ Params: { guildId: string; inviteId: string } }>(
    '/:inviteId',
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
            inviteId: {
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['guildId', 'inviteId'],
        },
        response: {
          204: {},
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { guildId, inviteId } = request.params;
      const { count } = await this.sql`
        DELETE FROM
          guild_invite
        WHERE
          id = ${inviteId}
        AND
          guild_id = ${guildId}
        RETURNING
          id;
      `;

      if (count !== 1) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'INVITE_NOT_FOUND' });
      }

      reply.statusCode = 204;
    },
  );
};

export default guildInvites;
