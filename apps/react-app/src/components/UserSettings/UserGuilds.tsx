import { ServerIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { Input } from '@/shared-components/Input';
import { ListItem } from '@/shared-components/ListItem';
import { useFilteredGuilds } from './hooks/useFilteredGuilds';
import { userSettingsActions } from './stores/useUserSettingsStore';

const { toggleOpen } = userSettingsActions;

export const UserGuilds = () => {
  const { guildNameFilter, guilds, setGuildNameFilter } = useFilteredGuilds();
  const navigate = useNavigate();

  const handleGuildClick = (id: string) => {
    navigate(`/app/server/${id}`);
    toggleOpen();
  };

  return (
    <div className='flex flex-col space-y-6 pl-8 pt-12'>
      <h1 className='text-3xl font-semibold text-gray-12'>Servers Manager</h1>
      <div className='flex items-center'>
        <Input
          id='guild-manager-filter'
          placeholder='Filter Servers'
          onChange={(e) => setGuildNameFilter(e.currentTarget.value)}
          value={guildNameFilter}
        />
      </div>
      <div className='flex flex-col space-y-2'>
        <span className='text-sm text-gray-11'>Servers - {guilds.length}</span>
        <ul className='space-y-1'>
          {guilds.map((g) => (
            <DefaultTooltip key={g.id} tootipText={`Go to ${g.name}`}>
              <ListItem
                intent='secondary'
                isActionable
                onClick={() => handleGuildClick(g.id)}
                className='!py-2.5'
              >
                <ServerIcon className='h-5 w-5' />
                <span className='ml-2.5 mr-auto'>{g.name}</span>
              </ListItem>
            </DefaultTooltip>
          ))}
        </ul>
      </div>
    </div>
  );
};
