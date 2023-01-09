import type { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { JWTPayload } from '@accord/common';
import { AccordAPIError } from '../lib/AccordAPIError';

export default fp(async (fastify) => {
  fastify.decorateRequest('userId', '');
  fastify.addHook(
    'onRequest',
    async (
      request: FastifyRequest<{
        Headers: { 'access-token': string; 'refresh-token': string };
      }>,
      reply,
    ) => {
      const { requiresAuthenticatedUser = true } = request.routeConfig;

      if (!requiresAuthenticatedUser) {
        return;
      }

      const accessToken = request.headers['access-token'];
      const refreshToken = request.headers['refresh-token'];

      if (
        typeof accessToken !== 'string' ||
        typeof refreshToken !== 'string' ||
        accessToken.trim().length === 0 ||
        refreshToken.trim().length === 0
      ) {
        throw new AccordAPIError({ statusCode: 401, clientMessage: 'ACCESS_DENIED' });
      }

      let accessTokenPayload: JWTPayload | null = null;

      try {
        accessTokenPayload = await fastify.jwt.verifyAccesstoken(accessToken);
        if (!accessTokenPayload) {
          throw new TypeError('accessTokenPayload is null/undefined');
        }
        request.userId = accessTokenPayload.id;
        request.accessToken = accessToken;
        request.refreshToken = refreshToken;
      } catch {
        try {
          await fastify.jwt.verifyRefreshtoken(refreshToken);
          const sessionAndUser = await fastify.authUtils.getSessionAndUser(refreshToken);

          if (!sessionAndUser) {
            throw new AccordAPIError({
              statusCode: 401,
              clientMessage: 'NOT_AUTHENTICATED',
              serverMessage: 'Session not found',
            });
          }

          const newAccesstToken = await fastify.jwt.createAccesstoken({
            id: sessionAndUser.user.id,
          });
          reply.header('access-token', newAccesstToken);

          request.userId = sessionAndUser.user.id;
          request.accessToken = newAccesstToken;
          request.refreshToken = refreshToken;
        } catch (e) {
          console.error(e);
          throw new AccordAPIError({ statusCode: 401, clientMessage: 'ACCESS_DENIED' });
        }
      }
    },
  );
});

declare module 'fastify' {
  export interface FastifyRequest {
    userId: string;
    accessToken: string;
    refreshToken: string;
  }
  export interface FastifyContextConfig {
    requiresAuthenticatedUser?: boolean;
  }
}
