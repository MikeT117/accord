import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import { AccordAPIError } from './lib/AccordAPIError';

export type AppOptions = Record<string, never> & Partial<AutoloadPluginOptions>;
const options: AppOptions = {};

const app: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.setErrorHandler(function (error, request, reply) {
    this.log.error(error);
    if (error instanceof AccordAPIError) {
      reply.status(error.statusCode).send({ message: error.message });
    } else if (error.validation) {
      reply.status(400).send({ message: 'REQUEST_VALIDATION_FAILED' });
    } else {
      reply.status(500).send({ message: 'UNKNOWN_ERROR' });
    }
  });

  fastify.addSchema({
    $id: 'error',
    type: 'object',
    description: 'Accord API Error Response',
    properties: {
      message: { type: 'string' },
    },
  });

  fastify.addSchema({
    $id: 'headers',
    type: 'object',
    properties: {
      'access-token': { type: 'string' },
      'refresh-token': { type: 'string' },
    },
    required: ['access-token', 'refresh-token'],
  });

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    routeParams: true,
    options: { prefix: '/api/v1', ...opts },
  });
};

export default app;

export { app, options };
