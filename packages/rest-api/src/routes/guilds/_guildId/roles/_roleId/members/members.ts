import type { FastifyPluginAsync } from 'fastify';
import { AccordOperation } from '@accord/common';
import type { GuildMember } from '@accord/common';

const guildRoleMembers: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{
    Params: { guildId: string; roleId: string };
    Querystring: { offset: number; limit: number; assigned: boolean };
  }>(
    '/',
    {
      config: {
        requireGuildPermission: 'guild_admin',
      },
      schema: {
        headers: fastify.getSchema('headers'),
        querystring: {
          type: 'object',
          properties: {
            offset: { type: 'number', default: 0 },
            limit: { type: 'number', enum: [10, 20, 30], default: 10 },
            assigned: { type: 'boolean' },
          },
          required: ['assigned'],
        },
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
                bannedByGuildMemberId: { type: 'string' },
                banDate: { type: 'string' },
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
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { guildId, roleId } = request.params;
      const { limit, offset, assigned } = request.query;
      return assigned
        ? this.sql<GuildMember[]>`
            WITH ASSIGNED_MEMBER_IDS_CTE AS (
              SELECT
                guild_member_id
              FROM
                guild_role_guild_members
              WHERE
                guild_role_id = ${roleId}
            )

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
              user_account ua ON gm.user_account_id = ua.id
            INNER JOIN
              guild_role_guild_members grgm ON grgm.guild_member_id = gm.id
            LEFT JOIN
              user_account_attachments uat ON uat.user_account_id = ua.id
            LEFT JOIN
              attachment a ON a.id = uat.attachment_id
            WHERE
              gm.guild_id = ${guildId}
            AND
              grgm.guild_role_id = ${roleId}
            OFFSET ${offset}
            LIMIT ${limit};
          `
        : this.sql<GuildMember[]>`
            WITH ASSIGNED_MEMBER_IDS_CTE AS (
              SELECT
                guild_member_id
              FROM
                guild_role_guild_members
              WHERE
                guild_role_id = ${roleId}
            )

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
              user_account ua ON gm.user_account_id = ua.id
            LEFT JOIN
              user_account_attachments uat ON uat.user_account_id = ua.id
            LEFT JOIN
              attachment a ON a.id = uat.attachment_id
            WHERE
              gm.guild_id = ${guildId}
            AND
              gm.id NOT IN (
                SELECT
                  guild_member_id
                FROM
                  ASSIGNED_MEMBER_IDS_CTE
              )
            OFFSET ${offset}
            LIMIT ${limit};
          `;
    },
  );

  fastify.post<{
    Params: { roleId: string; guildId: string };
    Body: { memberIds: string[] };
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
            memberIds: {
              type: 'array',
              minItems: 1,
              items: { type: 'string', format: 'uuid' },
            },
          },
        },
        response: {
          204: {},
          404: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { guildId, roleId } = request.params;
      const { memberIds } = request.body;

      await this.sql`
        INSERT INTO guild_role_guild_members
          (guild_role_id, guild_member_id)
        SELECT
          id,
          UNNEST(${memberIds}::uuid[])
        FROM
          guild_role
        WHERE
          id = ${roleId}
        AND
          guild_id = ${guildId};
      `;

      const guildRoleGuildMember = await this.sql<
        { id: string; userAccountId: string; roles: string[] }[]
      >`
          SELECT
            ARRAY_AGG(grgm.guild_role_id) as roles,
            gm.user_account_id,
            gm.id
          FROM
            guild_role_guild_members grgm
          INNER JOIN
            guild_member gm ON gm.id = grgm.guild_member_id
          WHERE
            gm.id = ANY(${memberIds}::uuid[])
          GROUP BY
            gm.id;
        `;

      const userIds = guildRoleGuildMember.map((g) => g.userAccountId);

      fastify.amqpUtils.sendToSocketSessionQueue({
        op: AccordOperation.SOCKET_SUBSCRIPTION_ADD,
        d: { userIds, roleIds: [roleId] },
      });

      for (const { id, userAccountId, roles } of guildRoleGuildMember) {
        fastify.amqpUtils.sendToGuildMemberQueue({
          op: AccordOperation.GUILD_MEMBER_UPDATE_OP,
          d: {
            member: { id, guildId, roles },
          },
          publishToUserIds: [userAccountId],
        });
      }

      reply.statusCode = 204;
    },
  );

  fastify.delete<{
    Params: { guildId: string; roleId: string; memberId: string };
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
            roleId: {
              type: 'string',
              format: 'uuid',
            },
            memberId: {
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['guildId', 'roleId', 'memberId'],
        },
        response: {
          204: {},
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { guildId, roleId, memberId } = request.params;

      const [member] = await this.sql<Pick<GuildMember, 'userAccountId'>[]>`
        SELECT
          user_account_id
        FROM
          guild_member
        WHERE
          id = ${memberId}
        AND
          guild_id = ${guildId};
      `;

      await this.sql`
        DELETE FROM
          guild_role_guild_members
        WHERE
          guild_role_id = ${roleId}
        AND
          guild_member_id = ${memberId};
      `;

      const [guildRoleGuildMember] = await this.sql<{ guildMemberId: string; roles: string[] }[]>`
        SELECT
          ARRAY_AGG(guild_role_id) as roles,
          guild_member_id
        FROM
          guild_role_guild_members
        WHERE
          guild_member_id = ${memberId}
        GROUP BY
          guild_member_id;
      `;

      fastify.amqpUtils.sendToSocketSessionQueue({
        op: AccordOperation.SOCKET_SUBSCRIPTION_REMOVE,
        d: { userIds: [member.userAccountId], roleIds: [roleId] },
      });

      fastify.amqpUtils.sendToGuildMemberQueue({
        op: AccordOperation.GUILD_MEMBER_UPDATE_OP,
        d: {
          member: { id: memberId, guildId, roles: guildRoleGuildMember.roles },
        },
        publishToUserIds: [member.userAccountId],
      });
    },
  );
};

export default guildRoleMembers;
