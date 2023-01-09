import { TransactionSql } from 'postgres';
import { sql } from '../../lib/postgres/client';

export const verifyChannelAuthorisation = async (
  guildId: string,
  channelId: string,
  userAccountId: string,
  tx?: TransactionSql<Record<string, unknown>>,
) => {
  const { count } = await (tx ?? sql)`
    SELECT
      grgm.guild_role_id 
    FROM
      guild_role_guild_members grgm
    INNER JOIN
      guild_member gm on gm.id = grgm.guild_member_id
    INNER JOIN
      guild_role_channels grc on grc.guild_role_id = grgm.guild_role_id
    INNER JOIN
      guild_role gr on gr.id = grc.guild_role_id
    WHERE
      grc.channel_id = ${channelId}
    AND 
      gm.user_account_id = ${userAccountId}
    AND
      gm.guild_id = ${guildId}
    AND
      gr.view_guild_channel
    AND NOT
      gm.is_banned
    LIMIT
      1;
    `;

  return count !== 0;
};
