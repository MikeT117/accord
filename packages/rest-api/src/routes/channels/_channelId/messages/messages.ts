import type { FastifyPluginAsync } from 'fastify';
import { AccordOperation } from '@accord/common';
import type {
  GuildChannel,
  ChannelMessage,
  Attachment,
  GuildMember,
  UserAccount,
} from '@accord/common';
import { AccordAPIError } from '../../../../lib/AccordAPIError';

const channelMessages: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
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
          cmcte.created_at DESC;
      `;
    },
  );

  fastify.post<{
    Params: { channelId: string };
    Body: { content: string; attachments: Omit<Attachment, 'id'>[] };
  }>(
    '/',
    {
      config: {
        requireGuildChannelPermission: 'create_channel_message',
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
          },
          required: ['channelId'],
        },
        body: {
          type: 'object',
          properties: {
            content: { type: 'string', default: '', nullable: true },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  height: { type: 'number', default: 0 },
                  width: { type: 'number', default: 0 },
                  src: { type: 'string' },
                  size: { type: 'number', default: 0 },
                  resourceType: { type: 'string' },
                  publicId: { type: 'string' },
                  signature: { type: 'string' },
                  timestamp: { type: 'number' },
                },
              },
              default: [],
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  content: { type: 'string', default: '' },
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
                  },
                  attachments: {
                    type: 'array',
                    items: { type: 'string' },
                    nullable: true,
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
      const { userId } = request;
      const { channelId } = request.params;
      const { content } = request.body;

      const [{ guildId }] = await this.sql<Pick<GuildChannel, 'guildId'>[]>`
        SELECT
          guild_id
        FROM
          channel
        WHERE
          id = ${channelId};
      `;

      const message = await this.sql.begin(async (tx) => {
        const [message] = await tx<Omit<ChannelMessage, 'author' | 'attachments' | 'member'>[]>`
          INSERT INTO channel_message
            (content, author_user_account_id, channel_id)
          VALUES
            (${content}, ${userId}, ${channelId})
          RETURNING
            *;
        `;

        if (request.body.attachments.length !== 0) {
          const attachments = await tx<Pick<Attachment, 'id' | 'src'>[]>`
            INSERT INTO attachment
              ${this.sql(request.body.attachments)}
            RETURNING
              id,
              src;
          `;

          await tx`
            INSERT INTO channel_message_attachments
            ${this.sql(
              attachments.map((a) => ({ channelMessageId: message.id, attachmentId: a.id })),
            )}
          `;

          return { ...message, attachments: attachments.map((a) => a.src) };
        }
        return { ...message, attachments: [] };
      });

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
          ua.id = ${userId};
      `;

      if (guildId) {
        const [member] = await this.sql<Pick<GuildMember, 'id' | 'nickname'>[]>`
          SELECT
            id,
            nickname
          FROM
            guild_member
          WHERE
            user_account_id = ${userId}
          AND
            guild_id = ${guildId};
        `;

        const channelRoleIds = await this.publishUtils.selectGuildRolesByChannelId(channelId);
        fastify.amqpUtils.sendToChannelMessageQueue({
          op: AccordOperation.CHANNEL_MESSAGE_CREATE_OP,
          d: { message: { ...message, author, member } },
          publishToRoleIds: channelRoleIds,
          excludedUserIds: [userId],
        });
      } else {
        const channelMemberIds = await this.publishUtils.selectChannelMembersByChannelId(channelId);
        fastify.amqpUtils.sendToChannelMessageQueue({
          op: AccordOperation.CHANNEL_MESSAGE_CREATE_OP,
          d: { message: { ...message, author } },
          publishToUserIds: channelMemberIds.filter((i) => i !== userId),
        });
      }

      return { message: { ...message, author } };
    },
  );

  fastify.delete<{
    Params: { messageId: string; channelId: string };
  }>(
    '/:messageId',
    {
      config: {
        requireGuildChannelPermission: 'view_guild_channel',
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

      const attachments = await this.sql<
        Pick<Attachment, 'publicId' | 'resourceType' | 'timestamp'>[]
      >`
        SELECT
          a.public_id,
          a.resource_type,
          a.timestamp
        FROM
          attachment a
        INNER JOIN
          channel_message_attachments cma ON a.id = cma.attachment_id
        WHERE
          cma.channel_message_id = ${messageId};
      `;

      const [message] = await this.sql<Pick<ChannelMessage, 'id' | 'isPinned' | 'channelId'>[]>`
        DELETE FROM
          channel_message
        WHERE
          id = ${messageId}
        AND
          channel_id = ${channelId}
        RETURNING
          id,
          is_pinned,
          channel_id;
      `;

      if (!message) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'MESSAGE_NOT_FOUND' });
      }

      await Promise.all(
        attachments.map((a) => this.cloudinary.deleteFile(a.publicId, a.resourceType, a.timestamp)),
      );

      const channelRoleIds = await this.publishUtils.selectGuildRolesByChannelId(channelId);
      const channelMemberIds = await this.publishUtils.selectChannelMembersByChannelId(channelId);

      fastify.amqpUtils.sendToChannelMessageQueue({
        op: AccordOperation.CHANNEL_MESSAGE_DELETE_OP,
        d: { message },
        publishToRoleIds: channelRoleIds,
        publishToUserIds: channelMemberIds.filter((i) => i !== userId),
        excludedUserIds: [userId],
      });

      reply.statusCode = 204;
    },
  );

  fastify.patch<{
    Params: { messageId: string; channelId: string };
    Body: { content: string };
  }>(
    '/:messageId',
    {
      config: {
        requireGuildChannelPermission: 'view_guild_channel',
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
        body: {
          type: 'object',
          properties: {
            content: { type: 'string' },
          },
          required: ['content'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: {
                properties: {
                  id: { type: 'string' },
                  content: { type: 'string' },
                  channelId: { type: 'string' },
                  isPinned: { type: 'string' },
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
      const { messageId, channelId } = request.params;
      const { content } = request.body;

      const [message] = await this.sql<Pick<ChannelMessage, 'id' | 'content' | 'channelId'>[]>`
        UPDATE
          channel_message
        SET
          content = ${content}
        WHERE
          id = ${messageId}
        AND
          channel_id = ${channelId}
        RETURNING
          id,
          content,
          channel_id;
      `;

      if (!message) {
        throw new AccordAPIError({
          clientMessage: 'MESSAGE_NOT_FOUND',
          statusCode: 404,
        });
      }

      const channelRoleIds = await this.publishUtils.selectGuildRolesByChannelId(channelId);
      const channelMemberIds = await this.publishUtils.selectChannelMembersByChannelId(channelId);

      fastify.amqpUtils.sendToChannelMessageQueue({
        op: AccordOperation.CHANNEL_MESSAGE_UPDATE_OP,
        d: { message },
        publishToRoleIds: channelRoleIds,
        publishToUserIds: channelMemberIds.filter((i) => i !== userId),
        excludedUserIds: [userId],
      });

      return { message };
    },
  );
};

export default channelMessages;
