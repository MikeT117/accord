import { sql } from '../../lib/postgres/client';

export const muteVoiceChannelState = async (
  guildId: string,
  channelId: string,
  userAccountId: string,
) => sql`
  UPDATE
    voice_channel_state
  SET
    muted = true
  WHERE
    channel_id = ${channelId}
  AND
    user_account_id = ${userAccountId}
  AND
    guild_id = ${guildId};
`;
