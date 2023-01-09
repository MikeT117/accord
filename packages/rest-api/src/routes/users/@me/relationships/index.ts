import type { FastifyPluginAsync } from 'fastify';
import { AccordOperation } from '@accord/common';
import type { UserAccount, UserRelationship } from '@accord/common';
import { AccordAPIError } from '../../../../lib/AccordAPIError';

const usersRelationships: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get(
    '/',
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
                status: { type: 'number' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                initiatorUserAccountId: { type: 'string' },
                recipientUserAccountId: { type: 'string' },
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
      const { userId } = request;
      return this.sql<UserRelationship[]>`
        SELECT
          ur.*,
          JSON_BUILD_OBJECT(
            'id', ua.id,
            'displayName', ua.display_name,
            'avatar', a.src
          ) as user
        FROM
          user_relationship ur
        INNER JOIN
          user_account ua ON (
            ua.id = initiator_user_account_id 
          OR 
            ua.id = ur.recipient_user_account_id) 
          AND 
            ua.id != ${userId}
        LEFT JOIN
          user_account_attachments uaa ON uaa.user_account_id = ua.id
        LEFT JOIN
          attachment a ON a.id = uaa.attachment_id
        WHERE
          (
            ur.status != 2
        AND
          (
            ur.initiator_user_account_id = ${userId} OR ur.recipient_user_account_id = ${userId})
          )
        OR
          ur.initiator_user_account_id = ${userId}`;
    },
  );

  fastify.post<{ Body: { displayName: string; status: number } }>(
    '/',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        body: {
          type: 'object',
          properties: {
            status: { type: 'number', enum: [1, 2] },
            displayName: { type: 'string' },
          },
          required: ['status', 'displayName'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              relationship: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'number' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  initiatorUserAccountId: { type: 'string' },
                  recipientUserAccountId: { type: 'string' },
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
          400: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { userId } = request;
      const { displayName, status } = request.body;

      const [recipient] = await this.sql<Pick<UserAccount, 'id' | 'displayName' | 'avatar'>[]>`
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
          display_name = ${displayName};
      `;

      if (!recipient) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'USER_NOT_FOUND' });
      }

      const [initiator] = await this.sql<Pick<UserAccount, 'id' | 'displayName' | 'avatar'>[]>`
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

      const [relationship] = await this.sql<Omit<UserRelationship, 'user'>[]>`
        INSERT INTO user_relationship
          (status, initiator_user_account_id, recipient_user_account_id)
        VALUES
          (${status}, ${initiator.id}, ${recipient.id})
        RETURNING
          *;
      `;

      if (relationship.status !== 2) {
        fastify.amqpUtils.sendToUserRelationshipQueue({
          op: AccordOperation.USER_RELATIONSHIP_CREATE_OP,
          d: { relationship: { ...relationship, user: { ...initiator } } },
          publishToUserIds: [recipient.id],
        });
      }

      return { relationship: { ...relationship, user: { ...recipient } } };
    },
  );

  fastify.patch<{ Params: { relationshipId: string } }>(
    '/:relationshipId/accept',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            relationshipId: { type: 'string', format: 'uuid' },
          },
          required: ['relationshipId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              relationship: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'number' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  initiatorUserAccountId: { type: 'string' },
                  recipientUserAccountId: { type: 'string' },
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
          404: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      const { userId } = request;
      const { relationshipId } = request.params;

      const [relationship] = await this.sql<Omit<UserRelationship, 'user'>[]>`
          UPDATE
            user_relationship
          SET
            status = 0
          WHERE
            recipient_user_account_id = ${userId}
          AND
            id = ${relationshipId}
          RETURNING
            *;
        `;

      if (!relationship) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'RELATIONSHIP_NOT_FOUND' });
      }

      const [recipient] = await this.sql<Pick<UserAccount, 'id' | 'displayName' | 'avatar'>[]>`
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
          ua.id = ${relationship.recipientUserAccountId};
      `;

      const [initiator] = await this.sql<Pick<UserAccount, 'id' | 'displayName' | 'avatar'>[]>`
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
          ua.id = ${relationship.initiatorUserAccountId};
      `;

      fastify.amqpUtils.sendToUserRelationshipQueue({
        op: AccordOperation.USER_RELATIONSHIP_UPDATE_OP,
        d: { relationship: { ...relationship, user: { ...recipient } } },
        publishToUserIds: [relationship.initiatorUserAccountId],
      });

      return { relationship: { ...relationship, user: { ...initiator } } };
    },
  );

  fastify.delete<{ Params: { relationshipId: string } }>(
    '/:relationshipId',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
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
      const { relationshipId } = request.params;

      const [relationship] = await this.sql<
        Pick<
          UserRelationship,
          'id' | 'status' | 'recipientUserAccountId' | 'initiatorUserAccountId'
        >[]
      >`
          SELECT
            id,
            status,
            recipient_user_account_id,
            initiator_user_account_id
          FROM
            user_relationship
          WHERE
            id = ${relationshipId}
          AND
            (
              (recipient_user_account_id = ${userId} AND status = ANY('{0,1}'::Int[]))
          OR
              (initiator_user_account_id = ${userId}AND status = ANY('{0,1,2}'::Int[]))
            );
        `;

      if (!relationship) {
        throw new AccordAPIError({ statusCode: 404, clientMessage: 'RELATIONSHIP_NOT_FOUND' });
      }

      await this.sql`
        DELETE FROM
          user_relationship
        WHERE
          id = ${relationshipId};
      `;

      if (relationship.status === 2) {
        fastify.amqpUtils.sendToUserRelationshipQueue({
          op: AccordOperation.USER_RELATIONSHIP_DELETE_OP,
          d: { relationship: { id: relationship.id } },
          publishToUserIds: [relationship.initiatorUserAccountId],
        });
      } else {
        fastify.amqpUtils.sendToUserRelationshipQueue({
          op: AccordOperation.USER_RELATIONSHIP_DELETE_OP,
          d: { relationship: { id: relationship.id } },
          publishToUserIds: [
            relationship.recipientUserAccountId,
            relationship.initiatorUserAccountId,
          ],
        });
      }

      reply.statusCode = 204;
    },
  );
};

export default usersRelationships;
