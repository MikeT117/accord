import type { FastifyPluginAsync } from 'fastify';
import { AccordOperation, GuildChannel } from '@accord/common';
import type {
  Guild,
  GuildMember,
  GuildRole,
  GuildRoleGuildMember,
  UserAccount,
} from '@accord/common';
import { AccordAPIError } from '../../../lib/AccordAPIError';

const guilds: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.post<{ Params: { guildId: string } }>(
    '/join',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        response: {
          204: {},
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { guildId } = request.params;
      const { userId } = request;

      return this.sql.begin(async (tx) => {
        const [existingMember] = await tx<Pick<GuildMember, 'id' | 'isBanned'>[]>`
          SELECT
            id,
            is_banned
          FROM
            guild_member
          WHERE
            user_account_id = ${userId}
          AND
            guild_id = ${guildId};
        `;

        if (existingMember) {
          if (existingMember.isBanned) {
            throw new AccordAPIError({
              clientMessage: 'MEMBER_IS_BANNED',
              statusCode: 400,
            });
          }
          throw new AccordAPIError({
            clientMessage: 'ALREADY_A_MEMBER',
            statusCode: 400,
          });
        }

        const [guild] = await tx<Omit<Guild, 'icon' | 'banner' | 'member' | 'roles'>[]>`
          UPDATE
            guild
          SET
            member_count = member_count + 1
          WHERE
            id = ${guildId}
          AND
            is_discoverable
          RETURNING
            *;
        `;

        if (!guild.isDiscoverable) {
          throw new AccordAPIError({
            clientMessage: 'INVITE_REQUIRED',
            statusCode: 403,
          });
        }

        const [guildMember] = await tx<Omit<GuildMember, 'user' | 'roles'>[]>`
          INSERT INTO guild_member
            (user_account_id, guild_id)
          VALUES
            (${userId}, ${guildId})
          RETURNING
            *;
        `;

        const [user] = await tx<Pick<UserAccount, 'id' | 'displayName' | 'avatar'>[]>`
          SELECT
            ua.id,
            ua.display_name,
            a.src as avatar
          FROM
            user_account ua
          LEFT JOIN
            user_account_attachments uaa ON uaa.user_account_id = ua.id
          LEFT JOIN
            attachment a ON a.id = uaa.attachment_id
          WHERE
            ua.id = ${userId};
          `;

        const guildMemberRoles = await tx<Pick<GuildRoleGuildMember, 'guildRoleId'>[]>`
          INSERT INTO guild_role_guild_members
            (guild_role_id, guild_member_id)
          SELECT
            id,
            ${guildMember.id}
          FROM
            guild_role
          WHERE
            guild_id = ${guildId}
          AND
            name = '@default'
          RETURNING
            guild_role_id;
        `;

        const guildMemberRoleIds = guildMemberRoles.map((r) => r.guildRoleId);

        const roles = await tx<GuildRole[]>`
          SELECT
            *
          FROM
            guild_role
          WHERE
            guild_id = ${guildId};
        `;

        const channels = await tx<GuildChannel[]>`
          SELECT
            c.*,
            COALESCE(ARRAY_AGG(grc.guild_role_id) FILTER (WHERE grc.guild_role_id IS NOT null), '{}') AS roles
          FROM
            channel c
          LEFT JOIN
            guild_role_channels grc ON grc.channel_id = c.id
          WHERE
            c.guild_id = ${guild.id}
          GROUP BY
            c.id
        `;

        const defaultGuildRoleId = roles.find((r) => r.name === '@default')?.id;

        if (!defaultGuildRoleId) {
          throw new AccordAPIError({
            clientMessage: 'GUILD_JOIN_FAILED',
            statusCode: 500,
            serverMessage: 'Default guild role is invalid',
          });
        }

        this.amqpUtils.sendToGuildQueue({
          op: AccordOperation.GUILD_UPDATE_OP,
          d: { guild: { id: guildId, memberCount: guild.memberCount } },
          publishToRoleIds: [defaultGuildRoleId],
        });

        fastify.amqpUtils.sendToSocketSessionQueue({
          op: AccordOperation.SOCKET_SUBSCRIPTION_ADD,
          d: { userIds: [userId], roleIds: guildMemberRoleIds },
        });

        fastify.amqpUtils.sendToGuildQueue({
          op: AccordOperation.GUILD_CREATE_OP,
          d: {
            guild: {
              ...guild,
              roles,
              member: { ...guildMember, user, roles: guildMemberRoleIds },
            },
            channels,
          },
          publishToUserIds: [userId],
        });

        reply.statusCode = 204;
      });
    },
  );
};

export default guilds;
