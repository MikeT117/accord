import type { Channel } from '@accord/common';
import { sql } from '../../lib/postgres/client';

export const getVoiceChannel = async (guildId: string, channelId: string) => sql<
  Pick<Channel, 'id' | 'type' | 'guildId'>[]
>`
    SELECT
      id,
      type,
      guild_id
    FROM
      channel
    WHERE
      id = ${channelId}
    AND
      guild_id = ${guildId}
    AND
      type = 4;
  `;
