import fp from 'fastify-plugin';
import { GithubValidateTokenResponse, GithubEmailResponse } from '../@types';
import { AccordAPIError } from '../lib/AccordAPIError';

export default fp(async (fastify) => {
  async function getGithubProfileFromAccesstoken(accessToken: string) {
    let profileResp: Response;

    try {
      profileResp = await fetch(process.env.OAUTH_GITHUB_TOKEN_VALIDATION_URI, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Basic ${Buffer.from(
            process.env.OAUTH_GITHUB_BASIC_AUTH,
            'utf-8',
          ).toString('base64')}`,
        },
        method: 'POST',
        body: JSON.stringify({ access_token: accessToken }),
      });
    } catch (e) {
      throw new AccordAPIError({
        statusCode: 500,
        clientMessage: 'OAUTH_PROFILE_RETRIEVAL_FAILED',
        serverMessage: 'Fetch failed, could not retrieve oauth profile from provider.',
      });
    }

    if (profileResp.status !== 200) {
      throw new AccordAPIError({
        statusCode: 500,
        clientMessage: 'OAUTH_PROFILE_RETRIEVAL_FAILED',
        serverMessage: 'Fetch failed (!200), could not retrieve oauth profile from provider.',
      });
    }

    let parsedProfileResp: GithubValidateTokenResponse;

    try {
      parsedProfileResp = await profileResp.json();
    } catch {
      throw new AccordAPIError({
        statusCode: 500,
        clientMessage: 'OAUTH_PROFILE_RETRIEVAL_FAILED',
        serverMessage: 'Could not parse oauth profile fetch response',
      });
    }
    const { id, login, avatar_url } = parsedProfileResp.user;

    let emailResp: Response;

    try {
      emailResp = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
    } catch {
      throw new AccordAPIError({
        statusCode: 500,
        clientMessage: 'OAUTH_PROFILE_RETRIEVAL_FAILED',
        serverMessage: 'Fetch failed, could not retrieve email addresses from oauth provider.',
      });
    }

    if (emailResp.status !== 200) {
      throw new AccordAPIError({
        statusCode: 500,
        clientMessage: 'OAUTH_PROFILE_RETRIEVAL_FAILED',
        serverMessage:
          'Fetch failed (!200), could not retrieve email addresses from oauth provider.',
      });
    }

    let parsedEmailResp: GithubEmailResponse[];

    try {
      parsedEmailResp = (await emailResp.json()) as GithubEmailResponse[];
    } catch {
      throw new AccordAPIError({
        statusCode: 500,
        clientMessage: 'OAUTH_PROFILE_RETRIEVAL_FAILED',
        serverMessage: 'Could not parse oauth profile email addresses fetch response',
      });
    }

    if (!Array.isArray(parsedEmailResp) || parsedEmailResp.length === 0) {
      throw new AccordAPIError({
        statusCode: 500,
        clientMessage: 'OAUTH_PROFILE_RETRIEVAL_FAILED',
        serverMessage: 'Oauth profile email addresses response is empty',
      });
    }

    const primaryEmail = parsedEmailResp.filter((e) => e.primary)[0];

    return {
      oauthId: id,
      displayName: login,
      image: avatar_url,
      email: primaryEmail.email,
      emailVerified: primaryEmail.verified,
    };
  }

  fastify.decorate('oauthUtils', {
    getGithubProfileFromAccesstoken,
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    oauthUtils: {
      getGithubProfileFromAccesstoken(accessToken: string): Promise<{
        oauthId: number;
        displayName: string;
        image: string;
        email: string;
        emailVerified: boolean;
      }>;
    };
  }
}
