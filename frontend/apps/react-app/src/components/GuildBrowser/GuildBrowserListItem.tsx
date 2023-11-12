import { Avatar } from '@/shared-components/Avatar';
import { Button } from '@/shared-components/Button';
import { Image } from '@/shared-components/Image';
import { useIsGuildMember } from './hooks/useIsMember';
import { env } from '../../env';
import { Guild } from '../../types';

export const GuildBrowserListItem = ({
  guild,
  onJoinGuild,
}: {
  guild: Pick<
    Guild,
    'id' | 'guildCategoryId' | 'name' | 'description' | 'memberCount' | 'banner' | 'icon'
  >;
  onJoinGuild: () => void;
}) => {
  const isGuildMember = useIsGuildMember(guild.id);
  return (
    <div className='group flex min-h-[320px] min-w-[240px] max-w-[20%] transform-gpu flex-col overflow-hidden rounded-md bg-gray-4 transition ease-in-out hover:scale-[101%] hover:bg-gray-5'>
      <Image src={env.cloudinaryResUrl + guild.banner} isActionable={false} h='160px' w='auto' />
      <Avatar
        src={guild.icon}
        size='xxl'
        className='relative top-[-40px] left-[8px] border-4 border-gray-4 transition ease-in-out group-hover:border-gray-5'
      />
      <div className='-mt-[32px] flex w-full grow flex-col px-3 pb-2'>
        <span className='mb-1 font-semibold text-gray-12'>{guild.name}</span>
        <span className='text-xs font-light text-gray-11'>{guild.description}</span>
        <Button onClick={onJoinGuild} className='mt-auto' disabled={isGuildMember} fullWidth>
          {isGuildMember ? 'Joined' : 'Join'}
        </Button>
        <span className='mt-1 block text-xs text-gray-11'>{guild.memberCount} Members</span>
      </div>
    </div>
  );
};
