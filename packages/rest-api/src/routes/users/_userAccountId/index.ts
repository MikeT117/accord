import type { FastifyPluginAsync } from 'fastify';
import { UserAccount } from '@accord/common';

const users: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{ Params: { userAccountId: string } }>(
    '/',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  displayName: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                  flags: { type: 'number' },
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
      const { userId } = request;
      const [user] = await this.sql<Omit<UserAccount, 'relationshipCount'> & { avatar?: string }[]>`
        SELECT
          ua.id,
          ua.display_name,
          a.src,
          ua.flags
        FROM
          user_account ua
        LEFT JOIN
          user_account_attachments uaa ON uaa.user_account_id = ua.id
        LEFT JOIN
          attachments a ON a.id = uaa.attachment_id
        WHERE
          ua.id = ${userId};
      `;

      return { user };
    },
  );
};

export default users;
