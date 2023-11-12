import { useParams } from 'react-router-dom';
import { useGuildStore } from '@/shared-stores/guildStore';
import { GuildChannel } from '../../../types';

export const useGuildTextChannel = () => {
  const { guildId = '', channelId = '' } = useParams();
  const guild = useGuildStore((s) => s.guilds[guildId]);

  if (!guild) {
    return null;
  }

  const memberRoles = guild.roles.filter((gr) => guild.member.roles.some((gmr) => gmr === gr.id));
  const channel = guild.channels.find((c) => c.id === channelId && c.channelType === 0) as
    | GuildChannel
    | null
    | undefined;

  if (!channel) {
    return null;
  }

  const channelMemberRoles = memberRoles.filter((cmr) => channel.roles.some((cr) => cmr.id));
  const permissions = channelMemberRoles.reduce((a, b) => {
    return a | b.permissions;
  }, 0);

  return { channel, permissions };
};
