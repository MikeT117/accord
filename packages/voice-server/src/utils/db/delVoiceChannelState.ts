import { sql } from '../../lib/postgres/client';

export const delVoiceChannelState = async (
  guildId: string,
  channelId: string,
  userAccountId: string,
) => sql`
  DELETE FROM
    voice_channel_state
  WHERE
    user_account_id = ${userAccountId}
  AND
    channel_id = ${channelId}
  AND
    guild_id = ${guildId}
`;
