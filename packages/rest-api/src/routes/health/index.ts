import { FastifyPluginAsync } from 'fastify';

const health: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get('/', { config: { requiresAuthenticatedUser: false } }, async function () {
    return { status: 'OK' };
  });
};

export default health;
