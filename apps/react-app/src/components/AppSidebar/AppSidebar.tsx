import { HomeIcon, ServerStackIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@/shared-components/IconButton';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { guildCreatorStore } from '@/components/GuildCreator';
import { useAppsidebarState } from './hooks/useAppsidebarState';
import { userSettingsStore } from '@/components/UserSettings';
import { Avatar } from '@/shared-components/Avatar';

export const AppSidebar = () => {
  const appSidebarState = useAppsidebarState();
  const navigate = useNavigate();

  if (!appSidebarState) {
    return null;
  }

  const { activeGuildId, guilds, user } = appSidebarState;

  return (
    <div className='col-span-1 row-span-full flex flex-col items-center overflow-y-auto border-r border-black p-3'>
      <ul className='flex flex-col items-center space-y-3'>
        <DefaultTooltip tootipText='User Dashboard' position='right' delayDuration={100}>
          <IconButton padding='l' onClick={() => navigate('/app/@me')} intent='secondary'>
            <HomeIcon className='h-5 w-5' />
          </IconButton>
        </DefaultTooltip>
        <DefaultTooltip tootipText='Create Server' position='right' delayDuration={100}>
          <IconButton padding='l' onClick={guildCreatorStore.toggleOpen} intent='secondary'>
            <PlusIcon className='h-5 w-5 stroke-2' />
          </IconButton>
        </DefaultTooltip>
        <DefaultTooltip tootipText='Public Servers' position='right' delayDuration={100}>
          <IconButton
            padding='l'
            onClick={() => navigate('/app/public-servers')}
            intent='secondary'
          >
            <ServerStackIcon className='h-5 w-5' />
          </IconButton>
        </DefaultTooltip>
      </ul>
      <ul className='my-6 flex flex-col items-center space-y-3'>
        {guilds.map(({ id, name, icon }) => (
          <DefaultTooltip key={id} tootipText={name} position='right' delayDuration={0}>
            <div className='group relative flex items-center'>
              {id === activeGuildId ? (
                <div className='absolute left-[-10px] h-[70%] w-[3px] bg-grayA-8' />
              ) : (
                <div className='absolute left-[-10px] h-[0] w-[3px] bg-grayA-8 group-hover:h-[40%]' />
              )}
              <IconButton padding='xxs' onClick={() => navigate(`/app/server/${id}`)}>
                <Avatar src={icon} fallback={name[0] + 'S'} size='xl' />
              </IconButton>
            </div>
          </DefaultTooltip>
        ))}
      </ul>
      <div className='mt-auto flex flex-col items-center'>
        <DefaultTooltip tootipText='User Settings' position='right'>
          <IconButton onClick={userSettingsStore.toggleOpen} intent='secondary'>
            <Cog6ToothIcon className='h-4 w-4' />
          </IconButton>
        </DefaultTooltip>
        <Avatar size='xl' className='mt-3' src={user.avatar} fallback={user.displayName} />
      </div>
    </div>
  );
};
