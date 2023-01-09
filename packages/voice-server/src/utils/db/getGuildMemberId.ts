import { GuildMember } from '@accord/common';
import { sql } from '../../lib/postgres/client';

export const getGuildMember = async (guildId: string, userAccountId: string) => {
  return sql<Pick<GuildMember, 'id'>[]>`
    SELECT
      id
    FROM
      guild_member gm
    INNER JOIN
      user_account ua ON ua.id = gm.user_account_id
    WHERE
      ua.id = ${userAccountId}
    AND
      gm.guild_id = ${guildId}
    LIMIT
      1;
  `;
};
