import type { FastifyPluginAsync } from 'fastify';
import { AccordOperation } from '@accord/common';
import type { UserAccount, PrivateChannel } from '@accord/common';
import { AccordAPIError } from '../../../../lib/AccordAPIError';

const channelMembers: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.put<{ Params: { channelId: string; newMemberUserAccountId: string } }>(
    '/:newMemberUserAccountId',
    {
      config: {
        requireChannelMember: true,
      },
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            channelId: { type: 'string', format: 'uuid' },
            newMemberUserAccountId: { type: 'string', format: 'uuid' },
          },
          required: ['channelId', 'newMemberUserAccountId'],
        },
        response: {
          204: {},
          404: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { channelId, newMemberUserAccountId } = request.params;

      const [userAccount] = await this.sql<Pick<UserAccount, 'id'>[]>`
        SELECT
          id
        FROM
          user_account
        WHERE
          id = ${newMemberUserAccountId}
      `;

      if (!userAccount) {
        throw new AccordAPIError({
          statusCode: 404,
          clientMessage: 'USER_NOT_FOUND',
        });
      }

      const { count } = await this.sql`
        INSERT INTO channel_user_accounts
          (user_account_id, channel_id)
        VALUES
          (${newMemberUserAccountId}, ${channelId}); 
      `;

      if (count !== 1) {
        throw new AccordAPIError({
          statusCode: 500,
          clientMessage: 'CHANNEL_MEMBER_ADD_FAILED',
        });
      }

      const [channel] = await this.sql<Pick<PrivateChannel, 'id' | 'type' | 'members'>[]>`
        SELECT
          c.id,
          c.type,
          ARRAY_AGG(
            JSON_BUILD_OBJECT(
              'id', ua.id,
              'displayName', ua.display_name,
              'avatar', a.src
            )
          ) as members
        FROM
          channel c
        INNER JOIN
          channel_user_accounts cua ON cua.channel_id = c.id
        INNER JOIN
          user_account ua ON ua.id = cua.user_account_id
        LEFT JOIN
          user_account_attachments uat ON uat.user_account_id = ua.id
        LEFT JOIN
          attachment a ON a.id = uat.attachment_id
        WHERE
          c.id = ${channelId}
        GROUP BY
          c.id;
      `;

      fastify.amqpUtils.sendToChannelQueue({
        op: AccordOperation.CHANNEL_UPDATE_OP,
        d: { channel },
        publishToUserIds: channel.members.map((m) => m.id),
      });

      reply.statusCode = 204;
    },
  );
};

export default channelMembers;
