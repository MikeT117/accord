import fp from 'fastify-plugin';
import oauthPlugin, { OAuth2Namespace } from '@fastify/oauth2';

export default fp(async (fastify) => {
  fastify.register(oauthPlugin, {
    name: 'githubOauth2',
    scope: ['read:user, user:email'],
    credentials: {
      client: {
        id: process.env.OAUTH_GITHUB_CLIENT_ID,
        secret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
      },
      auth: oauthPlugin.GITHUB_CONFIGURATION,
    },
    callbackUri: `${process.env.PUBLIC_URL}/api/v1/auth/github/callback`,
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    githubOauth2: OAuth2Namespace;
  }
}
