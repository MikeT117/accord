import type { FastifyPluginAsync } from 'fastify';

const github: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get(
    '/callback',
    {
      config: {
        requiresAuthenticatedUser: false,
      },
      schema: {
        querystring: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            state: { type: 'string' },
          },
          required: ['code', 'state'],
        },
        response: {
          204: {},
          400: fastify.getSchema('error'),
          500: fastify.getSchema('error'),
        },
      },
    },
    async function (request, reply) {
      const oauthToken = await this.githubOauth2.getAccessTokenFromAuthorizationCodeFlow(request);
      const oauthProfile = await this.oauthUtils.getGithubProfileFromAccesstoken(
        oauthToken.token.access_token,
      );

      const user =
        (await this.authUtils.getUserByProviderAndProviderAccountId({
          provider: 'github',
          providerAccountId: oauthProfile.oauthId.toString(),
        })) ??
        (await this.sql.begin(async (tx) => {
          const { oauthId, image, ...rest } = oauthProfile;
          const oauthAccount = await this.authUtils.createAccount(
            {
              type: 'oauth',
              provider: 'github',
              providerAccountId: oauthId.toString(),
              accessToken: oauthToken.token.access_token,
              tokenType: oauthToken.token.token_type,
            },
            tx,
          );
          return this.authUtils.createUser(
            { ...rest, avatar: image, oauthAccountId: oauthAccount.id },
            tx,
          );
        }));

      const refreshToken = await fastify.jwt.createRefreshtoken({
        id: user.id,
      });

      const accessToken = await fastify.jwt.createAccesstoken({
        id: user.id,
      });

      await this.authUtils.createUserSession({
        userAccountId: user.id,
        token: refreshToken,
      });

      reply.header('refresh-token', refreshToken);
      reply.header('access-token', accessToken);

      reply.redirect(
        `${process.env.PUBLIC_URL}?accesstoken=${accessToken}&refreshtoken=${refreshToken}`,
      );
    },
  );

  fastify.get(
    '/',
    {
      config: {
        requiresAuthenticatedUser: false,
      },
    },
    async (req, reply) => {
      const authorizationEndpoint = fastify.githubOauth2.generateAuthorizationUri(req);
      reply.redirect(authorizationEndpoint);
    },
  );
};

export default github;
