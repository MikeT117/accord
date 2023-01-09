import type { FastifyPluginAsync } from 'fastify';
import { AccordOperation } from '@accord/common';
import type {
  Attachment,
  Guild,
  GuildCategory,
  GuildMember,
  GuildRole,
  GuildRoleGuildMember,
  UserAccount,
} from '@accord/common';

const guilds: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{
    Querystring: { query: string; offset: number; limit: number };
  }>(
    '/',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        querystring: {
          type: 'object',
          properties: {
            query: { type: 'string', nullable: true },
            offset: { type: 'number', default: 0 },
            limit: { type: 'number', default: 20, enum: [10, 20, 30, 40, 50] },
          },
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string', nullable: true },
                icon: { type: 'string', nullable: true },
                banner: { type: 'string', nullable: true },
                isDiscoverable: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                ownerUserAccountId: { type: 'string' },
                guildCategoryId: { type: 'string', nullable: true },
                memberCount: { type: 'number' },
                channelCount: { type: 'number' },
              },
            },
          },
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { limit, offset, query } = request.query;
      return this.sql<Omit<Guild, 'roles' | 'member'>[]>`
        SELECT
          g.*,
          a_1.src as icon,
          a_2.src as banner
        FROM
          guild g
        LEFT JOIN
          guild_attachments ga_1 ON ga_1.guild_id = g.id AND ga_1.type = 0
        LEFT JOIN
          guild_attachments ga_2 ON ga_2.guild_id = g.id AND ga_2.type = 1
        LEFT JOIN
          attachment a_1 ON a_1.id = ga_1.attachment_id
        LEFT JOIN
          attachment a_2 ON a_2.id = ga_2.attachment_id
        WHERE
          is_discoverable
          ${
            query
              ? this.sql`
        AND
          LOWER(g.name) like LOWER(${'%' + query + '%'})
        OR
          LOWER(g.description) like LOWER(${'%' + query + '%'})`
              : this.sql``
          }
        OFFSET
          ${offset}
        LIMIT
          ${limit};
      `;
    },
  );

  fastify.post<{
    Body: {
      name: string;
      isDiscoverable: boolean;
      icon?: Omit<Attachment, 'id'>;
      guildCategoryId: string;
    };
  }>(
    '/',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            isDiscoverable: { type: 'boolean' },
            guildCategoryId: { type: 'string', format: 'uuid' },
            icon: {
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
          },
          required: ['name', 'isDiscoverable', 'guildCategoryId'],
        },
        response: {
          204: {},
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { userId } = request;
      const { name, isDiscoverable, icon, guildCategoryId } = request.body;
      const { guildRoleIds, guild, channels } = await this.sql.begin(async (tx) => {
        const [guild] = await tx<Omit<Guild, 'roles' | 'member' | 'icon' | 'banner'>[]>`
          INSERT INTO guild
            (
              name,
              is_discoverable,
              owner_user_account_id,
              guild_category_id
            )
          VALUES
            (
              ${name},
              ${isDiscoverable},
              ${userId},
              ${guildCategoryId}
            )
          RETURNING
            *;
        `;

        let guildIconSrc: string | undefined;

        if (icon) {
          const [attachment] = await tx<Pick<Attachment, 'src' | 'id'>[]>`
            INSERT INTO ATTACHMENT
              ${this.sql(icon)}
            RETURNING
              id,
              src;
          `;

          await tx`
            INSERT INTO guild_attachments
              (guild_id, attachment_id)
            VALUES
              (${guild.id}, ${attachment.id});
          `;

          guildIconSrc = attachment.src;
        }

        const [guildMember] = await tx<Omit<GuildMember, 'user'>[]>`
          INSERT INTO guild_member
            (user_account_id, guild_id)
          VALUES
            (${userId}, ${guild.id})
          RETURNING
            *;
        `;

        const [defaultGuildRole] = await tx<GuildRole[]>`
          INSERT INTO guild_role
            (
              guild_id,
              name,
              view_guild_channel
            )
          VALUES
            (
              ${guild.id},
              '@default',
              true
            )
          RETURNING
            *;
        `;

        const [ownerGuildRole] = await tx<GuildRole[]>`
          INSERT INTO guild_role
            (
              guild_id,
              name,
              view_guild_channel,
              manage_guild_channels,
              create_channel_message,
              manage_channel_messages,
              manage_guild,
              guild_admin
            )
          VALUES
            (
              ${guild.id},
              '@owner',
              true,
              true,
              true,
              true,
              true,
              true
            )
          RETURNING
            *;
        `;

        const guildMemberRoles = await tx<Pick<GuildRoleGuildMember, 'guildRoleId'>[]>`
          INSERT INTO guild_role_guild_members
            (guild_role_id, guild_member_id)
          VALUES 
            (${defaultGuildRole.id}, ${guildMember.id}),
            (${ownerGuildRole.id}, ${guildMember.id})
          RETURNING
            guild_role_id
        `;

        const guildRoleIds = guildMemberRoles.map((g) => g.guildRoleId);

        return {
          guildRoleIds,
          guild: {
            ...guild,
            icon: guildIconSrc,
            roles: [ownerGuildRole, defaultGuildRole],
            member: { ...guildMember, roles: guildRoleIds },
          },
          channels: [],
        };
      });

      const [user] = await this.sql<Pick<UserAccount, 'id' | 'displayName'>[]>`
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

      fastify.amqpUtils.sendToGuildQueue({
        op: AccordOperation.GUILD_CREATE_OP,
        d: {
          guild: {
            ...guild,
            member: { ...guild.member, user },
          },
          channels,
        },
        publishToUserIds: [userId],
      });

      fastify.amqpUtils.sendToSocketSessionQueue({
        op: AccordOperation.SOCKET_SUBSCRIPTION_ADD,
        d: { userIds: [userId], roleIds: guildRoleIds },
      });

      reply.statusCode = 204;
    },
  );

  fastify.patch<{
    Params: {
      guildId: string;
    };
    Body: {
      name: string;
      description: string;
      isDiscoverable: boolean;
      icon?: Omit<Attachment, 'id'>;
      banner?: Omit<Attachment, 'id'>;
      guildCategoryId: string;
    };
  }>(
    '/:guildId',
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
          },
          required: ['guildId'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            isDiscoverable: { type: 'boolean' },
            guildCategoryId: { type: 'string', format: 'uuid' },
            icon: {
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
            banner: {
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
          },
          required: ['name', 'description', 'isDiscoverable'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              guild: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  isDiscoverable: { type: 'boolean' },
                  icon: { type: 'string', nullable: true },
                  guildCategoryId: { type: 'string', nullable: true },
                  banner: { type: 'string', nullable: true },
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
      const { userId } = request;
      const { banner, icon, ...body } = request.body;

      const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

      return this.sql.begin(async (tx) => {
        const [guild] = await tx<
          Pick<Guild, 'id' | 'description' | 'isDiscoverable' | 'name' | 'guildCategoryId'>[]
        >`
          UPDATE
            guild
          SET
            ${this.sql(body)}
          WHERE
            id = ${guildId}
          RETURNING
            id,
            description,
            is_discoverable,
            name,
            guild_category_id;
          `;

        let _icon: string | undefined;

        if (icon) {
          const [existingAttachment] = await tx<
            Pick<Attachment, 'publicId' | 'resourceType' | 'timestamp'>[]
          >`
            DELETE FROM
              attachment
            WHERE
              id IN (
                SELECT
                  attachment_id
                FROM
                  guild_attachments
                WHERE
                  guild_id = ${guildId}
                AND
                  type = 0
              )
            RETURNING
              public_id,
              resource_type,
              timestamp;
          `;

          if (existingAttachment) {
            void this.cloudinary.deleteFile(
              existingAttachment.publicId,
              existingAttachment.resourceType,
              existingAttachment.timestamp,
            );
          }

          const [attachment] = await tx<Pick<Attachment, 'src' | 'id'>[]>`
            INSERT INTO ATTACHMENT
              ${this.sql(icon)}
            RETURNING
              id,
              src;
          `;

          await tx`
            INSERT INTO guild_attachments
              (guild_id, attachment_id, type)
            VALUES
              (${guild.id}, ${attachment.id}, 0);
          `;

          _icon = attachment.src;
        }

        let _banner: string | undefined;

        if (banner) {
          const [existingAttachment] = await tx<
            Pick<Attachment, 'publicId' | 'resourceType' | 'timestamp'>[]
          >`
            DELETE FROM
              attachment
            WHERE
              id IN (
                SELECT
                  attachment_id
                FROM
                  guild_attachments
                WHERE
                  guild_id = ${guildId}
                AND
                  type = 1
              )
            RETURNING
              public_id,
              resource_type,
              timestamp;
          `;

          if (existingAttachment) {
            void this.cloudinary.deleteFile(
              existingAttachment.publicId,
              existingAttachment.resourceType,
              existingAttachment.timestamp,
            );
          }

          const [attachment] = await tx<Pick<Attachment, 'src' | 'id'>[]>`
            INSERT INTO ATTACHMENT
              ${this.sql(banner)}
            RETURNING
              id,
              src;
          `;

          await tx`
            INSERT INTO guild_attachments
              (guild_id, attachment_id, type)
            VALUES
            (${guild.id}, ${attachment.id}, 1);
          `;

          _banner = attachment.src;
        }

        const updatedGuild = {
          ...guild,
          icon: _icon,
          banner: _banner,
        };

        for (const key in updatedGuild) {
          if (updatedGuild[key as keyof typeof updatedGuild] === undefined) {
            delete updatedGuild[key as keyof typeof updatedGuild];
          }
        }

        fastify.amqpUtils.sendToGuildQueue({
          op: AccordOperation.GUILD_UPDATE_OP,
          d: { guild: updatedGuild },
          publishToRoleIds: [defaultRoleId],
          excludedUserIds: [userId],
        });

        return { guild: updatedGuild };
      });
    },
  );

  fastify.delete<{ Params: { guildId: string } }>(
    '/:guildId',
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
          },
          required: ['guildId'],
        },
        response: {
          204: {},
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { guildId } = request.params;
      const { userId } = request;

      const defaultRoleId = await this.publishUtils.selectDefaultGuildRoleByGuildId(guildId);

      await this.sql`
        DELETE FROM
          guild
        WHERE
          id = ${guildId};
      `;

      fastify.amqpUtils.sendToGuildQueue({
        op: AccordOperation.GUILD_DELETE_OP,
        d: { guild: { id: guildId } },
        publishToRoleIds: [defaultRoleId],
        excludedUserIds: [userId],
      });

      reply.statusCode = 204;
    },
  );

  fastify.get(
    '/categories',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
          500: fastify.getSchema('error'),
        },
      },
    },
    async function () {
      return this.sql<GuildCategory[]>`
        SELECT
          *
        FROM
          guild_category;
      `;
    },
  );
};

export default guilds;
