import { UserSession } from '@accord/common';
import { FastifyPluginAsync } from 'fastify';
import { AccordAPIError } from '../../../../lib/AccordAPIError';

const userSessions: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{ Querystring: { offset: number; limit: number } }>(
    '/',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        querystring: {
          type: 'object',
          properties: {
            offset: { type: 'number', default: 0 },
            limit: { type: 'number', default: 50, enum: [50] },
          },
        },
        response: {
          204: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                createdAt: { type: 'string' },
              },
            },
          },
          400: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { userId, refreshToken } = request;
      const { limit, offset } = request.query;
      return this.sql<(Pick<UserSession, 'id' | 'createdAt'> & { isCurrentSession: boolean })[]>`
        SELECT
          id,
          created_at,
          token = ${refreshToken} as "isCurrentSession"
        FROM
          user_session
        WHERE
          user_account_id = ${userId}
        OFFSET
          ${offset}
        LIMIT
          ${limit};
      `;
    },
  );
  fastify.delete<{ Params: { sessionId: string } }>(
    '/:sessionId',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            sessionId: { type: 'string', format: 'uuid' },
          },
          required: ['sessionId'],
        },
        response: {
          204: {},
          400: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { userId, refreshToken } = request;
      const { sessionId } = request.params;
      const { count } = await this.sql`
        DELETE FROM
          user_session
        WHERE
          user_account_id = ${userId}
        AND
          id = ${sessionId}
        AND
          token != ${refreshToken};
      `;

      if (count !== 1) {
        throw new AccordAPIError({ clientMessage: 'SESSION_NOT_FOUND', statusCode: 404 });
      }

      reply.statusCode = 204;
    },
  );
};

export default userSessions;
