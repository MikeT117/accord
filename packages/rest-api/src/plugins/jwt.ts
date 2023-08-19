import { JWTPayload } from '@accord/common';
import { createSigner, createVerifier } from 'fast-jwt';
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  const createAccesstoken = createSigner({
    key: process.env.ACCESS_TOKEN_SECRET,
    iss: process.env.CORS_ORIGIN,
    expiresIn: 3600000,
  });
  const createRefreshtoken = createSigner({
    key: process.env.REFRESH_TOKEN_SECRET,
    iss: process.env.CORS_ORIGIN,
    expiresIn: 604800000,
  });

  const verifyAccesstoken = createVerifier({
    key: process.env.ACCESS_TOKEN_SECRET,
    allowedIss: process.env.CORS_ORIGIN,
    maxAge: 3600000,
  });

  const verifyRefreshtoken = createVerifier({
    key: process.env.REFRESH_TOKEN_SECRET,
    allowedIss: process.env.CORS_ORIGIN,
    maxAge: 604800000,
  });

  fastify.decorate('jwt', {
    createAccesstoken,
    createRefreshtoken,
    verifyAccesstoken,
    verifyRefreshtoken,
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    jwt: {
      createAccesstoken: (payload: string | Buffer | Record<string, unknown>) => string;
      createRefreshtoken: (payload: string | Buffer | Record<string, unknown>) => string;
      verifyAccesstoken: (token: string | Buffer) => JWTPayload;
      verifyRefreshtoken: (token: string | Buffer) => JWTPayload;
    };
  }
}
