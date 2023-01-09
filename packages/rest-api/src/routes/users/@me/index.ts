import type { FastifyPluginAsync } from 'fastify';
import { Attachment, UserAccount, UserRelationship } from '@accord/common';
import { AccordAPIError } from '../../../lib/AccordAPIError';

const usersMe: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get(
    '/',
    {
      schema: {
        produces: ['application/json'],
        headers: fastify.getSchema('headers'),
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  displayName: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                  email: { type: 'string' },
                  emailVerified: { type: 'boolean' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  flags: { type: 'number' },
                  relationshipCount: { type: 'number' },
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
      const [user] = await this.sql<UserAccount[]>`
        SELECT
          ua.*,
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
      return { user };
    },
  );

  fastify.patch<{
    Body: { displayName: string; avatar?: Omit<Attachment, 'id'> };
  }>(
    '/',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        body: {
          anyOf: [
            {
              type: 'object',
              properties: {
                displayName: { type: 'string' },
              },
              required: ['displayName'],
            },
            {
              type: 'object',
              properties: {
                avatar: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    height: { type: 'number' },
                    width: { type: 'number' },
                    src: { type: 'string' },
                    size: { type: 'number' },
                    resourceType: { type: 'string' },
                    publicId: { type: 'string' },
                    signature: { type: 'string' },
                    timestamp: { type: 'number' },
                  },
                },
                displayName: { type: 'string' },
              },
              required: ['avatar', 'displayName'],
            },
          ],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  displayName: { type: 'string' },
                  avatar: { type: 'string' },
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
      const { avatar, displayName } = request.body;
      const { userId } = request;

      let _avatar: string | undefined;

      if (avatar) {
        const [currentAvatar] = await this.sql<
          Pick<Attachment, 'publicId' | 'resourceType' | 'timestamp'>[]
        >`
          SELECT
            a.public_id,
            a.resource_type,
            a.timestamp
          FROM
            user_account_attachments uat
          INNER JOIN
            attachment a ON a.id = uat.attachment_id
          WHERE
            uat.user_account_id = ${userId};
        `;

        _avatar = await this.sql.begin(async (tx) => {
          if (currentAvatar) {
            await this.cloudinary.deleteFile(
              currentAvatar.publicId,
              currentAvatar.resourceType,
              currentAvatar.timestamp,
            );
          }

          await tx`
            DELETE FROM
              user_account_attachments
            WHERE
              user_account_id = ${userId};
          `;

          const [attachment] = await tx<Pick<Attachment, 'id' | 'src'>[]>`
            INSERT INTO attachment 
              ${this.sql(avatar)}
            RETURNING
              id,
              src;
          `;

          await tx`
            INSERT INTO user_account_attachments
              (user_account_id, attachment_id)
            VALUES
              (${userId}, ${attachment.id});
          `;

          return attachment.src;
        });
      }

      const [user] = await this.sql<Pick<UserAccount, 'id' | 'displayName'>[]>`
        UPDATE
          user_account
        SET
          display_name = ${displayName}
        WHERE
          id = ${userId}
        RETURNING
          id,
          display_name;
        `;
      return _avatar ? { user: { ...user, avatar: _avatar } } : { user };
    },
  );

  fastify.delete(
    '/',
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
      const { userId } = request;

      return this.sql.begin(async (tx) => {
        const oauthAccountClean = await tx`
          DELETE FROM
            oauth_account
          WHERE
            id = (
              SELECT
                oauth_account_id
              FROM
                user_account
              WHERE
                id = ${userId}
            );
        `;

        if (oauthAccountClean.count !== 1) {
          throw new AccordAPIError({ clientMessage: 'ACCOUNT_DELETION_FAILED', statusCode: 500 });
        }

        const userAccountClean = await tx`
          UPDATE
            user_account
          SET
            display_name = 'Deleted User',
            email = null,
            email_verified = false,
            flags = 0,
            relationship_count = 0
          WHERE
            id = ${userId};
        `;

        if (userAccountClean.count !== 1) {
          throw new AccordAPIError({ clientMessage: 'ACCOUNT_DELETION_FAILED', statusCode: 500 });
        }

        await tx`
          DELETE FROM
            user_session
          WHERE
            user_account_id = ${userId};
        `;

        const relationships = await tx<
          Pick<UserRelationship, 'initiatorUserAccountId' | 'recipientUserAccountId'>[]
        >`
          DELETE FROM
            user_relationship
          WHERE
            initiator_user_account_id = ${userId}
          OR
            recipient_user_account_id = ${userId}
          RETURNING
            initiator_user_account_id,
            recipient_user_account_id;
        `;

        const recipients = relationships.map((r) =>
          r.initiatorUserAccountId === userId ? r.recipientUserAccountId : r.initiatorUserAccountId,
        );

        await tx`
          UPDATE
            user_account
          SET
            relationship_count = relationship_count - 1
          WHERE
            id = ANY(${recipients}::uuid[]);
        `;

        await tx`
          DELETE FROM
            user_account_attachments
          WHERE
            user_account_id = ${userId};
        `;

        reply.statusCode = 204;
      });
    },
  );

  fastify.post(
    '/logout',
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
      const { userId, refreshToken } = request;
      await this.authUtils.deleteSession(userId, refreshToken);
      reply.statusCode = 204;
    },
  );
};

export default usersMe;
