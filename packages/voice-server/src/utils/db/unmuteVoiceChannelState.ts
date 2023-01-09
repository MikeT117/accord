import { sql } from '../../lib/postgres/client';

export const unmuteVoiceChannelState = async (
  guildId: string,
  channelId: string,
  userAccountId: string,
) => sql`
  UPDATE
    voice_channel_states
  SET
    muted = false
  WHERE
    channel_id = ${channelId}
  AND
    user_account_id = ${userAccountId}
  AND
    guild_id = ${guildId}
`;
