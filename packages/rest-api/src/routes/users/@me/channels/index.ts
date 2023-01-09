import type { PrivateChannel, UserAccount } from '@accord/common';
import { AccordOperation } from '@accord/common';
import { FastifyPluginAsync } from 'fastify';

const userChannels: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.post<{ Body: { users: string[] } }>(
    '/',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        body: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              minItems: 1,
              items: { type: 'string', format: 'uuid' },
            },
          },
          required: ['users'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              channel: {
                properties: {
                  id: { type: 'string' },
                  type: { type: 'number' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  members: {
                    type: 'array',
                    items: {
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
          400: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { userId } = request;
      const { users } = request.body;
      const type = users.length === 1 ? 2 : 3;
      const memberIds = [userId, ...users];

      return this.sql.begin(async (tx) => {
        const [channel] = await tx<PrivateChannel[]>`
          INSERT INTO channel
            (type)
          VALUES
            (${type})
          RETURNING
            *;
        `;

        await tx`
          INSERT INTO channel_user_accounts
            (user_account_id, channel_id)
          SELECT
            ua.id,
            ${channel.id}
          FROM
            user_account ua
          WHERE
            ua.id = ANY(${memberIds}::uuid[]);
        `;

        const members = await tx<Pick<UserAccount, 'id' | 'displayName' | 'avatar'>[]>`
          SELECT
            ua.id,
            ua.display_name,
            a.src as avatar
          FROM
            user_account ua
          LEFT JOIN
            user_account_attachments uat ON uat.user_account_id = ua.id
          LEFT JOIN
            attachment a ON a.id = uat.attachment_id
          WHERE
            ua.id = ANY(${memberIds}::uuid[]);
        `;

        fastify.amqpUtils.sendToChannelQueue({
          op: AccordOperation.CHANNEL_CREATE_OP,
          d: { channel: { ...channel, members } },
          publishToUserIds: users,
        });

        return { channel: { ...channel, members } };
      });
    },
  );
};
export default userChannels;
