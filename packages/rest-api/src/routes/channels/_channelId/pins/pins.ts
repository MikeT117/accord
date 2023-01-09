import type { FastifyPluginAsync } from 'fastify';
import { AccordOperation } from '@accord/common';
import type { ChannelMessage, GuildChannel, GuildMember, UserAccount } from '@accord/common';
import { AccordAPIError } from '../../../../lib/AccordAPIError';

const channelPins: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{
    Params: { channelId: string };
    Querystring: { offset: number; limit: number };
  }>(
    '/',
    {
      config: {
        requireGuildChannelPermission: 'view_guild_channel',
        requireChannelMember: true,
      },
      schema: {
        headers: fastify.getSchema('headers'),
        querystring: {
          type: 'object',
          properties: {
            offset: { type: 'number', default: 0 },
            limit: { type: 'number', default: 50, enum: [50] },
          },
        },
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
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                content: { type: 'string' },
                channelId: { type: 'string' },
                isPinned: { type: 'boolean' },
                flags: { type: 'number' },
                author: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    displayName: { type: 'string' },
                    avatar: { type: 'string', nullable: true },
                  },
                },
                member: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    nickname: { type: 'string', nullable: true },
                  },
                  nullable: true,
                },
                attachments: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  nullable: true,
                },
              },
            },
          },
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { channelId } = request.params;
      const { limit, offset } = request.query;

      return this.sql<ChannelMessage[]>`
      WITH CHANNEL_MESSAGE_CTE AS (
        SELECT
          *
        FROM
          channel_message
        WHERE
          channel_id = ${channelId}
        AND
          is_pinned = true
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      ),

      CHANNEL_CTE AS (
        SELECT
          guild_id
        FROM
          channel
        WHERE
          id = ${channelId}
      ),

      CHANNEL_MESSAGE_AUTHOR_CTE AS (
        SELECT
          ua.id,
          JSON_BUILD_OBJECT(
            'id', ua.id,
            'displayName', ua.display_name,
            'avatar', a.src
          ) as author
        FROM
          user_account ua
        LEFT JOIN
          user_account_attachments uat ON uat.user_account_id = ua.id
        LEFT JOIN
          attachment a ON a.id = uat.attachment_id
        WHERE
          ua.id IN (
            SELECT
              author_user_account_id
            FROM 
              CHANNEL_MESSAGE_CTE
          )
      ),

      GUILD_MEMBER_CTE AS (
        SELECT
          gm.user_account_id,
          JSON_BUILD_OBJECT(
            'id', gm.id,
            'nickname', gm.nickname
          ) as member
        FROM
          guild_member gm
        WHERE
          gm.guild_id = (
            SELECT
              guild_id
            FROM
              CHANNEL_CTE
          )
        AND
          gm.user_account_id IN (
            SELECT
              author_user_account_id
            FROM 
              CHANNEL_MESSAGE_CTE
          )
      ),

      CHANNEL_MESSAGE_ATTACHMENT_CTE AS (
        SELECT
          cma.channel_message_id,
          JSON_AGG(a.src) as attachments
        FROM
          channel_message_attachments cma
        INNER JOIN
          attachment a ON a.id = cma.attachment_id
        WHERE
          channel_message_id IN (
            SELECT
              id
            FROM
              CHANNEL_MESSAGE_CTE
          )
        GROUP BY
          cma.channel_message_id
      )

      SELECT
        cmcte.*,
        cmau.author,
        cmat.attachments,
        gmcte.member
      FROM
        CHANNEL_MESSAGE_CTE cmcte
      INNER JOIN
        CHANNEL_MESSAGE_AUTHOR_CTE cmau ON cmau.id = cmcte.author_user_account_id
      LEFT JOIN
        GUILD_MEMBER_CTE gmcte ON gmcte.user_account_id = cmcte.author_user_account_id
      LEFT JOIN
        CHANNEL_MESSAGE_ATTACHMENT_CTE cmat ON cmat.channel_message_id = cmcte.id
      ORDER BY
        cmcte.created_at DESC
    `;
    },
  );

  fastify.put<{
    Params: { messageId: string; channelId: string };
  }>(
    '/:messageId',
    {
      config: {
        requireGuildChannelPermission: 'manage_channel_messages',
        requireChannelMember: true,
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
            messageId: {
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['channelId', 'messageId'],
        },

        response: {
          204: {},
          404: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { userId } = request;
      const { messageId, channelId } = request.params;

      const [message] = await this.sql<Omit<ChannelMessage, 'author' | 'member' | 'attachments'>[]>`
        UPDATE
          channel_message
        SET
          is_pinned = true
        WHERE
          id = ${messageId}
        AND
          channel_id = ${channelId}
        RETURNING
          *;
      `;

      if (!message) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'MESSAGE_NOT_FOUND' });
      }

      const [guildChannel] = await this.sql<Pick<GuildChannel, 'guildId'>[]>`
        SELECT
          guild_id
        FROM
          channel
        WHERE
          id = ${channelId};
      `;

      const [attachments] = await this.sql<{ srcs: string[] }[]>`
        SELECT
          array_agg(a.src) AS srcs
        FROM
          channel_message_attachments cma
        INNER JOIN
          attachment a ON a.id = cma.attachment_id
        WHERE
          cma.channel_message_id = ${message.id}
      `;

      const [author] = await this.sql<Pick<UserAccount, 'id' | 'displayName'>[]>`
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
          ua.id = ${message.authorUserAccountId};
      `;
      if (guildChannel) {
        const [member] = await this.sql<Pick<GuildMember, 'id' | 'nickname'>[]>`
          SELECT
            id,
            nickname
          FROM
            guild_member
          WHERE
            user_account_id = ${userId}
          AND
            guild_id = ${guildChannel.guildId};
        `;

        const channelRoleIds = await this.publishUtils.selectGuildRolesByChannelId(channelId);
        this.amqpUtils.sendToChannelPinQueue({
          op: AccordOperation.CHANNEL_PIN_CREATE_OP,
          d: { message: { ...message, attachments: attachments.srcs, author, member } },
          publishToRoleIds: channelRoleIds,
          excludedUserIds: [userId],
        });
      } else {
        const channelMemberIds = await this.publishUtils.selectChannelMembersByChannelId(channelId);
        this.amqpUtils.sendToChannelPinQueue({
          op: AccordOperation.CHANNEL_PIN_CREATE_OP,
          d: { message: { ...message, attachments: attachments.srcs, author } },
          publishToUserIds: channelMemberIds.filter((i) => i !== userId),
        });
      }

      reply.statusCode = 204;
    },
  );

  fastify.delete<{
    Params: { messageId: string; channelId: string };
  }>(
    '/:messageId',
    {
      config: {
        requireGuildChannelPermission: 'manage_channel_messages',
        requireChannelMember: true,
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
            messageId: {
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['channelId', 'messageId'],
        },

        response: {
          204: {},
          404: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { userId } = request;
      const { messageId, channelId } = request.params;

      const { count } = await this.sql`
        UPDATE
          channel_message
        SET
          is_pinned = false
        WHERE
          id = ${messageId}
        AND
          channel_id = ${channelId};
      `;

      if (count !== 1) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'MESSAGE_NOT_FOUND' });
      }

      const [guildChannel] = await this.sql<Pick<GuildChannel, 'guildId'>[]>`
        SELECT
          guild_id
        FROM
          channel
        WHERE
          id = ${channelId};
      `;

      if (guildChannel) {
        const channelRoleIds = await this.publishUtils.selectGuildRolesByChannelId(channelId);
        this.amqpUtils.sendToChannelPinQueue({
          op: AccordOperation.CHANNEL_PIN_DELETE_OP,
          d: { message: { id: messageId, channelId } },
          publishToRoleIds: channelRoleIds,
          excludedUserIds: [userId],
        });
      } else {
        const channelMemberIds = await this.publishUtils.selectChannelMembersByChannelId(channelId);
        this.amqpUtils.sendToChannelPinQueue({
          op: AccordOperation.CHANNEL_PIN_DELETE_OP,
          d: { message: { id: messageId, channelId } },
          publishToUserIds: channelMemberIds.filter((i) => i !== userId),
        });
      }

      reply.statusCode = 204;
    },
  );
};

export default channelPins;
