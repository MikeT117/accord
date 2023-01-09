import { AccordAPIError } from '../../../../lib/AccordAPIError';
import { AccordOperation, Guild } from '@accord/common';
import type { GuildMember } from '@accord/common';
import type { FastifyPluginAsync } from 'fastify';

const guildMembers: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{
    Params: { guildId: string };
    Querystring: { offset: number; limit: number };
  }>(
    '/',
    {
      config: {
        requireGuildMember: true,
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
                nickname: { type: 'string', nullable: true },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                guildId: { type: 'string' },
                isBanned: { type: 'boolean' },
                banReason: { type: 'string', nullable: true },
                bannedByGuildMemberId: { type: 'string', nullable: true },
                banDate: { type: 'string', nullable: true },
                userAccountId: { type: 'string' },
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
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { guildId } = request.params;
      const { limit, offset } = request.query;

      return this.sql<GuildMember[]>`
      SELECT
        gm.*,
        ARRAY_AGG(grgm.guild_role_id) as roles,
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
        LEFT JOIN
          guild_role_guild_members grgm ON grgm.guild_member_id = gm.id
        WHERE
          gm.guild_id = ${guildId}
        AND NOT
          gm.is_banned
        GROUP BY
          gm.id,
          ua.id,
          a.src
        ORDER BY
          gm.created_at
        OFFSET ${offset}
        LIMIT ${limit};
      `;
    },
  );
  fastify.delete<{ Params: { guildId: string; memberId: string } }>(
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
          required: ['guildId'],
        },
        response: {
          204: {},
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { guildId, memberId } = request.params;

      const [member] = await this.sql<Pick<GuildMember, 'id' | 'userAccountId'>[]>`
        SELECT
          id,
          user_account_id
        FROM
          guild_member
        WHERE
          id = ${memberId}
        AND
          guild_id = ${guildId};
      `;

      if (!member) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'MEMBER_NOT_FOUND' });
      }

      const roleIds = await this.publishUtils.selectGuildRolesByMemberId(guildId, member.id);

      const guild = await this.sql.begin(async (tx) => {
        await tx<Pick<GuildMember, 'userAccountId'>[]>`
          DELETE FROM
            guild_member
          WHERE
            id = ${memberId}
          RETURNING
            user_account_id;
        `;

        const [guild] = await tx<Pick<Guild, 'id' | 'memberCount'>[]>`
          UPDATE 
            guild
          SET
            member_count = member_count - 1
          WHERE
            id = ${guildId}
          RETURNING
            id,
            member_count;
        `;

        return guild;
      });

      const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

      this.amqpUtils.sendToGuildQueue({
        op: AccordOperation.GUILD_UPDATE_OP,
        d: { guild },
        publishToRoleIds: [defaultRoleId],
      });

      this.amqpUtils.sendToGuildQueue({
        op: AccordOperation.GUILD_DELETE_OP,
        d: { guild: { id: guildId } },
        publishToUserIds: [member.userAccountId],
      });

      this.amqpUtils.sendToSocketSessionQueue({
        op: AccordOperation.SOCKET_SUBSCRIPTION_REMOVE,
        d: { roleIds, userIds: [member.userAccountId] },
      });
    },
  );
};

export default guildMembers;
