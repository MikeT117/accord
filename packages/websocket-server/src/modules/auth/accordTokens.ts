import { UserSession, UserAccount } from '@accord/common';
import { createSigner, createVerifier } from 'fast-jwt';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../../lib/constants';
import { sql } from '../../lib/postgres/client';

export const verifyAccordRefreshToken = createVerifier({
  key: REFRESH_TOKEN_SECRET,
  allowedIss: process.env.HOST,
  maxAge: 604800000, // 7 Days
});

export const createAccordRefreshtoken = createSigner({
  key: REFRESH_TOKEN_SECRET,
  iss: process.env.HOST,
  expiresIn: 604800000, // 7 Days
});

export const verifyAccordAccessToken = createVerifier({
  key: ACCESS_TOKEN_SECRET,
  allowedIss: process.env.HOST,
  maxAge: 600000, // 30 Minutes
});

export const createAccordAccesstoken = createSigner({
  key: ACCESS_TOKEN_SECRET,
  iss: process.env.HOST,
  expiresIn: 600000, // 30 Minutes
});

export const verifyToken = async ({ refreshToken }: { refreshToken: string }) => {
  try {
    await verifyAccordRefreshToken(refreshToken);

    const [session] = await sql<UserSession[]>`
      SELECT
        *
      FROM
        user_session
      WHERE
        token = ${refreshToken};
    `;

    if (!session) return;

    const [user] = await sql<UserAccount[]>`
      SELECT
        *
      FROM
        user_account
      WHERE
        id = ${session.userAccountId};
    `;

    if (!user) return;

    return user.id;
  } catch (e) {
    return;
  }
};
