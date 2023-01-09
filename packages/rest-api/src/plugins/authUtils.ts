import fp from 'fastify-plugin';
import type { UserAccount, Attachment, OauthAccount, UserSession } from '@accord/common';
import { TransactionSql } from 'postgres';

export default fp(async (fastify) => {
  async function createUser(
    {
      avatar,
      ...user
    }: Pick<UserAccount, 'oauthAccountId' | 'displayName'> &
      Partial<Omit<UserAccount, 'id' | 'displayName'>> & { avatar?: string },
    tx?: TransactionSql<Record<string, unknown>>,
  ) {
    const [newUser] = await (tx ?? fastify.sql)<Omit<UserAccount, 'avatar'>[]>`
      INSERT INTO user_account
        ${fastify.sql(user)}
      RETURNING
        *;
    `;

    if (avatar) {
      const [attachment] = await (tx ?? fastify.sql)<Pick<Attachment, 'id' | 'src'>[]>`
        INSERT INTO attachment
          (src)
        VALUES
          (${avatar})
        RETURNING
          id,
          src;
        `;

      await (tx ?? fastify.sql)`
        INSERT INTO user_account_attachments
          (user_account_id, attachment_id)
        VALUES
          (${newUser.id}, ${attachment.id})
      `;
    }

    return newUser;
  }

  async function getUserById(id: string) {
    const [userAccount] = await fastify.sql<Omit<UserAccount, 'avatar'>[]>`
      SELECT
        *
      FROM
        user_account
      WHERE
        id = ${id}
    `;

    return userAccount;
  }

  async function getUserByEmail(email: string) {
    const [userAccount] = await fastify.sql<Omit<UserAccount, 'avatar'>[]>`
      SELECT
        *
      FROM
        user_account
      wherew
        email = ${email}
    `;
    return userAccount;
  }

  async function getUserByProviderAndProviderAccountId({
    providerAccountId,
    provider,
  }: {
    providerAccountId: string;
    provider: string;
  }) {
    const [userAccount] = await fastify.sql<Omit<UserAccount, 'avatar'>[]>`
      SELECT
        ua.*
      FROM
        user_account ua
      INNER JOIN
        oauth_account oa ON ua.oauth_account_id = oa.id
      WHERE
        oa.provider = ${provider}
      AND
        oa.provider_account_id = ${providerAccountId};
    `;
    return userAccount;
  }
  async function updateUser(
    user: Pick<UserAccount, 'id'> & Partial<Omit<UserAccount, 'id' | 'avatar'>>,
    tx?: TransactionSql<Record<string, unknown>>,
  ) {
    const [userAccount] = await (tx ?? fastify.sql)<Omit<UserAccount, 'avatar'>[]>`
      UPDATE
        user_account
      SET
        ${fastify.sql(user)}
      RETURNING
        *;
    `;
    return userAccount;
  }
  async function createAccount(
    account: Pick<
      OauthAccount,
      'type' | 'provider' | 'providerAccountId' | 'accessToken' | 'tokenType'
    > &
      Partial<
        Omit<OauthAccount, 'type' | 'provider' | 'providerAccountId' | 'accessToken' | 'tokenType'>
      >,
    tx?: TransactionSql<Record<string, unknown>>,
  ) {
    const [oauthAccount] = await (tx ?? fastify.sql)<OauthAccount[]>`
      INSERT INTO oauth_account
        ${fastify.sql(account)}
      RETURNING
        *;
    `;
    return oauthAccount;
  }
  async function createUserSession(
    session: Partial<Omit<UserSession, 'id'>>,
    tx?: TransactionSql<Record<string, unknown>>,
  ) {
    const [userSession] = await (tx ?? fastify.sql)<UserSession[]>`
      INSERT INTO user_session
        ${fastify.sql(session)}
      RETURNING
        *;
    `;
    return userSession;
  }
  async function getSessionAndUser(sessionToken: string) {
    const [session] = await fastify.sql<UserSession[]>`
        SELECT
          *
        FROM
          user_session
        WHERE
          token = ${sessionToken};
      `;

    if (!session) return;

    const [user] = await fastify.sql<Omit<UserAccount, 'avatar'>[]>`
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
  }

  async function updateSession(
    session: Pick<UserSession, 'id'> & Partial<Omit<UserSession, 'id'>>,
    tx?: TransactionSql<Record<string, unknown>>,
  ) {
    const [userSession] = await (tx ?? fastify.sql)<UserSession[]>`
      UPDATE
        user_session
      SET
        ${fastify.sql(session)}
      WHERE
        id = ${session.id}
    `;

    return userSession;
  }

  async function deleteSession(
    userId: string,
    sessionToken: string,
    tx?: TransactionSql<Record<string, unknown>>,
  ) {
    const [userSession] = await (tx ?? fastify.sql)<UserSession[]>`
      DELETE FROM
        user_session
      WHERE
        token = ${sessionToken}
      AND
        user_account_id = ${userId}
      RETURNING
        *;
    `;
    return userSession;
  }

  fastify.decorate('authUtils', {
    deleteSession,
    createAccount,
    createUser,
    createUserSession,
    getSessionAndUser,
    getUserByEmail,
    getUserById,
    getUserByProviderAndProviderAccountId,
    updateSession,
    updateUser,
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    authUtils: {
      deleteSession(
        userId: string,
        sessionToken: string,
        tx?: TransactionSql<Record<string, unknown>>,
      ): Promise<UserSession>;
      updateSession(
        session: Pick<UserSession, 'id'> & Partial<Omit<UserSession, 'id'>>,
        tx?: TransactionSql<Record<string, unknown>>,
      ): Promise<UserSession>;
      getSessionAndUser(sessionToken: string): Promise<
        | {
            session: UserSession;
            user: Omit<UserAccount, 'avatar'>;
          }
        | undefined
      >;
      createUserSession(
        session: Partial<Omit<UserSession, 'id'>>,
        tx?: TransactionSql<Record<string, unknown>>,
      ): Promise<UserSession>;
      createAccount(
        account: Pick<
          OauthAccount,
          'type' | 'provider' | 'providerAccountId' | 'accessToken' | 'tokenType'
        > &
          Partial<
            Omit<
              OauthAccount,
              'type' | 'provider' | 'providerAccountId' | 'accessToken' | 'tokenType'
            >
          >,
        tx?: TransactionSql<Record<string, unknown>>,
      ): Promise<OauthAccount>;
      updateUser(
        user: Pick<UserAccount, 'id'> & Partial<Omit<UserAccount, 'id'>>,
        tx?: TransactionSql<Record<string, unknown>>,
      ): Promise<Omit<UserAccount, 'avatar'>>;
      getUserByProviderAndProviderAccountId({
        providerAccountId,
        provider,
      }: {
        providerAccountId: string;
        provider: string;
      }): Promise<UserAccount | undefined>;
      getUserByEmail(email: string): Promise<Omit<UserAccount, 'avatar'>>;
      getUserById(id: string): Promise<Omit<UserAccount, 'avatar'>>;
      createUser(
        {
          avatar,
          ...user
        }: Pick<UserAccount, 'oauthAccountId' | 'displayName'> &
          Partial<Omit<UserAccount, 'id' | 'displayName'>> & {
            avatar?: string | undefined;
          },
        tx?: TransactionSql<Record<string, unknown>>,
      ): Promise<Omit<UserAccount, 'avatar'>>;
    };
  }
}
