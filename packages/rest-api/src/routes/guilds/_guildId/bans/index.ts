import type { FastifyPluginAsync } from 'fastify';
import { AccordOperation, Guild, GuildMember, UserAccount } from '@accord/common';
import { AccordAPIError } from '../../../../lib/AccordAPIError';

const bannedGuildMembers: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{ Params: { guildId: string; offset: number; limit: number } }>(
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
                nickname: { type: 'string', nullable: true },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                guildId: { type: 'string' },
                isBanned: { type: 'boolean' },
                banReason: { type: 'string' },
                banDate: { type: 'string' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    displayName: { type: 'string' },
                    avatar: { type: 'string', nullable: true },
                  },
                },
                bannedByGuildMember: {
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
      const { guildId, limit = 10, offset = 0 } = request.params;

      return this.sql<GuildMember[]>`WITH BANNED_MEMBERS_CTE AS (
          SELECT
            gm.*,
            JSON_BUILD_OBJECT(
              'id', ua.id,
              'displayName', ua.display_name,
              'avatar', a.src
              ) as user
          FROM
            guild_member gm
          INNER JOIN
            user_account ua ON ua.id = gm.user_account_id
          LEFT JOIN
            user_account_attachments uat ON uat.user_account_id = ua.id
          LEFT JOIN
            attachment a ON a.id = uat.attachment_id
          WHERE
            gm.guild_id = ${guildId}
          AND
            gm.is_banned
          OFFSET 
            ${offset}
          LIMIT
            ${limit}
          )

        SELECT
          bmcte.*,
            JSON_BUILD_OBJECT(
              'id', gm.id,
              'nickname', gm.nickname,
              'user', JSON_BUILD_OBJECT(
                'id', ua.id,
                'displayName', ua.display_name,
                'avatar', a.src
                )
              ) as "bannedByGuildMember"
        FROM
          BANNED_MEMBERS_CTE bmcte
        INNER JOIN
          guild_member gm ON gm.id = bmcte.banned_by_guild_member_id
        INNER JOIN
          user_account ua ON gm.user_account_id = ua.id
        LEFT JOIN
          user_account_attachments uat ON uat.user_account_id = ua.id
        LEFT JOIN
          attachment a ON a.id = uat.attachment_id;
      `;
    },
  );

  fastify.put<{
    Params: { guildId: string; memberId: string };
    Body: { banReason: string };
  }>(
    '/:memberId',
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
            memberId: {
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['guildId', 'memberId'],
        },
        body: {
          type: 'object',
          properties: {
            banReason: { type: 'string', default: '' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              guildMember: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  nickname: { type: 'string', nullable: true },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  guildId: { type: 'string' },
                  isBanned: { type: 'boolean' },
                  banReason: { type: 'string' },
                  banDate: { type: 'string' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      displayName: { type: 'string' },
                      avatar: { type: 'string', nullable: true },
                    },
                  },
                  bannedByGuildMember: {
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
          },
          404: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { userId } = request;
      const { memberId, guildId } = request.params;
      const { banReason } = request.body;

      const [guild] = await this.sql<Pick<Guild, 'id' | 'ownerUserAccountId'>[]>`
        SELECT
          id,
          owner_user_account_id
        FROM
          guild
        WHERE
          id = ${guildId};
      `;

      if (!guild) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'SERVER_NOT_FOUND' });
      }

      const [guildMember] = await this.sql<Pick<GuildMember, 'userAccountId' | 'isBanned'>[]>`
        SELECT
          user_account_id,
          is_banned
        FROM
          guild_member
        WHERE
          id = ${memberId}
        AND
          guild_id = ${guildId};
      `;

      if (!guildMember) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'MEMBER_NOT_FOUND' });
      }

      if (guildMember.userAccountId === guild.ownerUserAccountId) {
        throw new AccordAPIError({ statusCode: 400, clientMessage: 'CANNOT_BAN_SERVER_OWNER' });
      }

      if (guildMember.isBanned) {
        throw new AccordAPIError({ statusCode: 400, clientMessage: 'MEMBER_ALREADY_BANNED' });
      }

      const [updatedGuildMember] = await this.sql<
        Omit<GuildMember, 'user' | 'bannedByGuildMember' | 'roles'>[]
      >`
        UPDATE
          guild_member
        SET
          is_banned = true,
          ban_reason = ${banReason},
          ban_date = CURRENT_TIMESTAMP,
          banned_by_guild_member_id = (
            SELECT
              id
            FROM
              guild_member
            WHERE
              guild_id = ${guild.id}
            AND
              user_account_id = ${userId}
          )
        WHERE
          id = ${memberId}
        AND
          guild_id = ${guild.id}
        RETURNING
          *;
      `;

      const [user] = await this.sql<Pick<UserAccount, 'id' | 'displayName' | 'avatar'>[]>`
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
          ua.id = ${guildMember.userAccountId}
      `;

      const [bannedByGuildMember] = await this.sql<GuildMember['bannedByGuildMember'][]>`
        SELECT
          gm.id,
          gm.nickname,
          JSON_BUILD_OBJECT(
            'id', ua.id,
            'displayName', ua.display_name,
            'avatar', a.src
            ) as user
        FROM
          guild_member gm
        INNER JOIN
          user_account ua ON ua.id = gm.user_account_id
        LEFT JOIN
          user_account_attachments uat ON uat.user_account_id = ua.id
        LEFT JOIN
          attachment a ON a.id = uat.attachment_id
        WHERE
          gm.user_account_id = ${userId}
        AND
          gm.guild_id = ${guildId};
      `;

      const [guildMemberRoles] = await this.sql<{ roleIds: string[] }[]>`
        SELECT
          ARRAY_AGG(guild_role_id) as "roleIds"
        FROM
          guild_role_guild_members
        WHERE
          guild_member_id = ${memberId};
      `;

      fastify.amqpUtils.sendToGuildQueue({
        op: AccordOperation.GUILD_DELETE_OP,
        d: { guild: { id: guildId } },
        publishToUserIds: [guildMember.userAccountId],
      });

      fastify.amqpUtils.sendToSocketSessionQueue({
        op: AccordOperation.SOCKET_SUBSCRIPTION_REMOVE,
        d: { roleIds: guildMemberRoles.roleIds, userIds: [guildMember.userAccountId] },
      });

      return { guildMember: { ...updatedGuildMember, bannedByGuildMember, user } };
    },
  );

  fastify.delete<{
    Params: { guildId: string; memberId: string };
  }>(
    '/:memberId',
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
            memberId: {
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['guildId', 'memberId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              guildMember: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  nickname: { type: 'string', nullable: true },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  guildId: { type: 'string' },
                  isBanned: { type: 'boolean' },
                  banReason: { type: 'string', nullable: true },
                  banDate: { type: 'string', nullable: true },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      displayName: { type: 'string' },
                      avatar: { type: 'string', nullable: true },
                    },
                  },
                  roles: {
                    type: 'array',
                    items: {
                      type: 'string',
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
      const { memberId, guildId } = request.params;

      const [guild] = await this.sql<Pick<Guild, 'id' | 'ownerUserAccountId'>[]>`
        SELECT
          id
        FROM
          guild
        WHERE
          id = ${guildId};
      `;

      if (!guild) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'SERVER_NOT_FOUND' });
      }

      const [guildMember] = await this.sql<Pick<GuildMember, 'isBanned'>[]>`
        SELECT
          is_banned
        FROM
          guild_member
        WHERE
          id = ${memberId}
        AND
          guild_id = ${guildId};
      `;

      if (!guildMember) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'MEMBER_NOT_FOUND' });
      }

      if (!guildMember.isBanned) {
        throw new AccordAPIError({ statusCode: 400, clientMessage: 'MEMBER_NOT_BANNED' });
      }

      const [updatedGuildMember] = await this.sql<
        Omit<GuildMember, 'user' | 'bannedByGuildMember' | 'roles'>[]
      >`
        UPDATE
          guild_member
        SET
          is_banned = false,
          ban_reason = '',
          ban_date = null,
          banned_by_guild_member_id = null
        WHERE
          id = ${memberId}
        AND
          guild_id = ${guildId}
        AND
          is_banned
        RETURNING
          *;
      `;

      if (!guildMember) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'MEMBER_NOT_FOUND' });
      }

      const [user] = await this.sql<Pick<UserAccount, 'id' | 'displayName' | 'avatar'>[]>`
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
          ua.id = ${updatedGuildMember.userAccountId}
      `;

      const [guildMemberRoles] = await this.sql<{ roleIds: string[] }[]>`
        SELECT
          ARRAY_AGG(guild_role_id) as "roleIds"
        FROM
          guild_role_guild_members
        WHERE
          guild_member_id = ${memberId};
      `;

      fastify.amqpUtils.sendToSocketSessionQueue({
        op: AccordOperation.SOCKET_SUBSCRIPTION_ADD,
        d: { roleIds: guildMemberRoles.roleIds, userIds: [updatedGuildMember.userAccountId] },
      });

      return {
        guildMember: { ...updatedGuildMember, user, roles: guildMemberRoles.roleIds },
      };
    },
  );
};
export default bannedGuildMembers;
