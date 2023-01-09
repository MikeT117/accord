import type { FastifyPluginAsync } from 'fastify';
import type {
  Attachment,
  Channel,
  Guild,
  GuildInvite,
  GuildMember,
  GuildRole,
  GuildRoleGuildMember,
  UserAccount,
} from '@accord/common';
import { AccordOperation } from '@accord/common';
import { AccordAPIError } from '../../lib/AccordAPIError';

const invites: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{ Params: { inviteId: string } }>(
    '/:inviteId',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            inviteId: { type: 'string', format: 'uuid' },
          },
          required: ['inviteId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              invite: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'number' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  isJoined: { type: 'boolean' },
                  guild: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      icon: { type: 'string', nullable: true },
                      banner: { type: 'string', nullable: true },
                      description: { type: 'string' },
                      memberCount: { type: 'number' },
                    },
                  },
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
          },
          404: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { inviteId } = request.params;
      const { userId } = request;

      const [invite] = await this.sql<GuildInvite[]>`
      SELECT
        *
      FROM
        guild_invite
      WHERE
        id = ${inviteId};
    `;

      if (!invite) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'INVITE_NOT_FOUND' });
      }

      const [guild] = await this.sql<Pick<Guild, 'id' | 'description' | 'name' | 'memberCount'>[]>`
          SELECT
            id,
            description,
            name,
            member_count
          FROM
            guild
          WHERE
            id = ${invite.guildId}
        `;

      const attachments = await this.sql<(Pick<Attachment, 'src'> & { type: 0 | 1 })[]>`
          SELECT
            a.src,
            ga.type
          FROM
            guild_attachments ga
          INNER JOIN
            attachment a on a.id = ga.attachment_id
          WHERE
            ga.guild_id = ${invite.guildId};
        `;

      const [creator] = await this.sql<
        (GuildMember & {
          user: Pick<UserAccount, 'id' | 'displayName'> &
            Pick<GuildMember, 'nickname'> & {
              avatar?: string;
            };
        })[]
      >`
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
            user_account_attachments uat on uat.user_account_id = ua.id
          LEFT JOIN
            attachment a ON a.id = uat.attachment_id
          WHERE
            gm.id = ${invite.guildMemberId};
        `;

      const isJoined = await this.sql<Pick<GuildMember, 'id'>[]>`
          SELECT
            id
          FROM
            guild_member
          WHERE
            user_account_id = ${userId}
          AND
            guild_id = ${invite.guildId}
          LIMIT 1;
        `;

      return {
        invite: {
          ...invite,
          guild: {
            ...guild,
            icon: attachments.find((a) => a.type === 0)?.src,
            banner: attachments.find((a) => a.type === 1)?.src,
          },
          creator,
          isJoined: isJoined.count === 1,
        },
      };
    },
  );

  fastify.post<{ Params: { inviteId: string } }>(
    '/:inviteId/accept',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            inviteId: { type: 'string', format: 'uuid' },
          },
          required: ['inviteId'],
        },
        response: {
          204: {},
          400: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { userId } = request;
      const { inviteId } = request.params;

      const [invite] = await this.sql<Pick<GuildInvite, 'guildId'>[]>`
        SELECT
          guild_id
        FROM
          guild_invite
        WHERE
          id = ${inviteId}
      `;

      if (!invite) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'INVITE_NOT_FOUND' });
      }

      const { count } = await this.sql`
        SELECT
          id
        FROM
          guild_member
        WHERE
          user_account_id = ${userId}
        AND
          guild_id = ${invite.guildId}
      `;

      if (count !== 0) {
        throw new AccordAPIError({ statusCode: 400, clientMessage: 'ALREADY_A_MEMBER' });
      }

      const { member, guildRoleIds } = await this.sql.begin(async (tx) => {
        const [member] = await tx<GuildMember[]>`
          INSERT INTO guild_member
            (user_account_id, guild_id)
          VALUES
            (${userId}, ${invite.guildId})
          RETURNING
            *;
        `;

        const [user] = await tx<
          (Pick<UserAccount, 'id' | 'displayName'> & {
            avatar?: string;
          })[]
        >`
          SELECT
            ua.id,
            ua.display_name,
            a.src as avatar
          FROM
            user_account ua
          LEFT JOIN
            user_account_attachments uat on uat.user_account_id = ua.id
          LEFT JOIN
            attachment a ON a.id = uat.attachment_id
          WHERE
            ua.id = ${userId};
        `;

        const memberRoles = await tx<Pick<GuildRoleGuildMember, 'guildRoleId'>[]>`
          INSERT INTO guild_role_guild_members
            (guild_role_id, guild_member_id)
          SELECT
            id,
            ${member.id}
          FROM
            guild_role
          WHERE
            guild_id = ${invite.guildId}
          AND
            name = '@default'
          RETURNING
            guild_role_id
        `;

        const guildRoleIds = memberRoles.map((g) => g.guildRoleId);
        return {
          guildRoleIds: guildRoleIds,
          member: { ...member, user, roles: guildRoleIds },
        };
      });

      const [guild] = await this.sql<Guild[]>`
        SELECT
          *
        FROM
          guild
        WHERE
          id = ${invite.guildId};
      `;

      const guildAttachments = await this.sql<(Pick<Attachment, 'src'> & { type: 0 | 1 })[]>`
        SELECT
          a.src,
          ga.type
        FROM
          guild_attachments ga
        INNER JOIN
          attachment a on a.id = ga.attachment_id
        WHERE
          ga.guild_id = ${invite.guildId};
      `;

      const roles = await this.sql<GuildRole[]>`
        SELECT
          *
        FROM
          guild_role
        WHERE
          guild_id = ${invite.guildId}
      `;

      const channels = await this.sql<
        (Omit<Channel, 'type' | 'guildId'> & {
          guildId: string;
          type: 0 | 1 | 4;
          roles: string[];
        })[]
      >`
        WITH CHANNELS_CTE as (
          SELECT
            *
          FROM
            channel
          WHERE
            guild_id = ${invite.guildId}
        ),
        
        CHANNEL_ROLES_CTE AS (
          SELECT
            json_agg(guild_role_id) as roles,
            channel_id
          FROM
            guild_role_channels
          WHERE
            channel_id in (
              SELECT
                id
              FROM
                CHANNELS_CTE
            )
          GROUP BY
            channel_id
        )
        
        SELECT
          ccte.*,
          crcte.roles
        FROM
          CHANNELS_CTE ccte
        INNER JOIN
          CHANNEL_ROLES_CTE crcte on ccte.id = crcte.channel_id;
      `;

      fastify.amqpUtils.sendToSocketSessionQueue({
        op: AccordOperation.SOCKET_SUBSCRIPTION_ADD,
        d: { userIds: [userId], roleIds: guildRoleIds },
      });

      fastify.amqpUtils.sendToGuildQueue({
        op: AccordOperation.GUILD_CREATE_OP,
        d: {
          guild: {
            ...guild,
            icon: guildAttachments.find((a) => a.type === 0)?.src,
            banner: guildAttachments.find((a) => a.type === 1)?.src,
            roles,
            member,
          },
          channels,
        },
        publishToUserIds: [userId],
      });
      reply.statusCode = 204;
    },
  );
};

export default invites;
