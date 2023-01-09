import { GuildRole } from '@accord/common';
import { sql } from '../../lib/postgres/client';

export const getDefaultGuildRole = async (guildId: string) => sql<Pick<GuildRole, 'id'>[]>`
    SELECT
      id
    FROM
      guild_role
    WHERE
      guild_id = ${guildId}
    AND
      name = '@default';
  `;
