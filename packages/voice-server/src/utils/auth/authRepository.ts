import type { UserSession, UserAccount } from '@accord/common';
import { sql } from '../../lib/postgres/client';

export const AuthRepository = {
  getSessionAndUser: async (token: string) => {
    const [session] = await sql<UserSession[]>`
      SELECT
        *
      FROM
        user_session
      WHERE
        token = ${token};
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

    return {
      session,
      user,
    };
  },
};
