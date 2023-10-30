import { GuildBrowserSearch } from './GuildBrowserSearch';
import { GuildBrowserSidebar } from './GuildBrowserSidebar';
import { DiscoverableGuildsList } from './DiscoverableGuildsList';

export const GuildBrowser = () => (
  <>
    <GuildBrowserSidebar />
    <div className='col-start-3 col-end-4 row-start-1 row-end-3 flex flex-col items-center overflow-y-auto bg-gray-2 p-10'>
      <GuildBrowserSearch />
      <DiscoverableGuildsList />
    </div>
  </>
);
