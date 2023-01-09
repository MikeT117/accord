import type { FastifyPluginAsync } from 'fastify';

const attachments: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.post<{ Body: { fileName: string } }>(
    '/',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        body: {
          type: 'object',
          properties: {
            fileName: { type: 'string' },
          },
          required: ['fileName'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              signature: { type: 'string' },
              timestamp: { type: 'number' },
              publicId: { type: 'string' },
            },
          },
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request) {
      return this.cloudinary.sign(request.body.fileName);
    },
  );

  fastify.post<{
    Body: { publicId: string; signature: string; resourceType: string; timestamp: number };
  }>(
    '/destroy',
    {
      schema: {
        headers: fastify.getSchema('headers'),
        body: {
          type: 'object',
          properties: {
            publicId: { type: 'string' },
            signature: { type: 'string' },
            resourceType: { type: 'string' },
            timestamp: { type: 'number' },
          },
          required: ['publicId', 'signature', 'resourceType', 'timestamp'],
        },
        response: {
          200: {},
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const { publicId, resourceType, timestamp } = request.body;
      const fileDeleted = await this.cloudinary.deleteFile(publicId, resourceType, timestamp);
      reply.statusCode = fileDeleted ? 200 : 500;
    },
  );
};

export default attachments;
