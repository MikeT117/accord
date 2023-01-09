import { GuildMember, UserAccount, VoiceChannelState } from '@accord/common';
import { sql } from '../../lib/postgres/client';

export const addVoiceChannelState = async (
  guildId: string,
  channelId: string,
  userAccountId: string,
) => {
  const [member] = await sql<
    (GuildMember & {
      user: Pick<UserAccount, 'id' | 'displayName'> & {
        avatar?: string;
      };
    })[]
  >`
    SELECT
      gm.id,
      gm.nickname,
      JSON_BUILD_OBJECT(
        'id', ua.id,
        'displayName', ua.display_name,
        'avatar', a.src
      ) as user
    FROM
      guild_member gm
    INNER JOIN
      user_account ua ON gm.user_account_id = ua.id
    LEFT JOIN
      user_account_attachments uat ON uat.user_account_id = ua.id
    LEFT JOIN
      attachment a ON a.id = uat.attachment_id
    WHERE
      gm.user_account_id = ${userAccountId}
    AND
      gm.guild_id = ${guildId};
  `;

  const [channelVoiceState] = await sql<VoiceChannelState[]>`
    INSERT INTO voice_channel_state 
      (channel_id, guild_id, user_account_id)
    VALUES
      (${channelId}, ${guildId}, ${userAccountId})
    ON CONFLICT (channel_id, user_account_id) DO 
    UPDATE
    SET
      channel_id = EXCLUDED.channel_id,
      guild_id = EXCLUDED.guild_id,
      user_account_id = EXCLUDED.user_account_id
    RETURNING
      *;
  `;

  return { ...channelVoiceState, member };
};
