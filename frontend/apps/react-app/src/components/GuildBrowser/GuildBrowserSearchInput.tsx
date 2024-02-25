import { Input } from '@/shared-components/Input';
import { useDiscoverableGuildsSearch } from './hooks/useDiscoverableGuildsSearch';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const GuildBrowserSearchInput = () => {
    const { LL } = useI18nContext();
    const { filter, initiateSearch, setFilter } = useDiscoverableGuildsSearch();

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && filter) {
            e.preventDefault();
            initiateSearch();
        }
    };

    const handleFilterOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.currentTarget.value);
    };

    return (
        <Input
            className='!bg-gray-3'
            value={filter}
            onKeyUp={handleKeyUp}
            onChange={handleFilterOnChange}
            placeholder={LL.Inputs.Placeholders.SearchServers()}
            rightInputElement={<MagnifyingGlass size={20} className='text-gray-11' />}
        />
    );
};
