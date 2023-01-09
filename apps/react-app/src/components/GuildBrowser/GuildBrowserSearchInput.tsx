import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Input } from '@/shared-components/Input';
import { useDiscoverableGuildsSearch } from './hooks/useDiscoverableGuildsSearch';

export const GuildBrowserSearchInput = () => {
  const { filter, initiateSearch, setFilter } = useDiscoverableGuildsSearch();

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      initiateSearch();
    }
  };

  return (
    <Input
      className='!bg-gray-3'
      value={filter}
      onKeyUp={handleKeyUp}
      onChange={(e) => setFilter(e.currentTarget.value)}
      placeholder='Search for servers...'
      rightInputElement={<MagnifyingGlassIcon className='h-5 w-5 text-gray-11' />}
    />
  );
};
