import { GuildBrowserBanner } from '@/assets/banners/GuildBrowserBanner';
import { GuildBrowserSearchInput } from './GuildBrowserSearchInput';

export const GuildBrowserSearch = () => (
  <div className='relative mb-6 flex'>
    <GuildBrowserBanner />
    <div className='absolute top-[50%] left-[50%] z-50 flex w-full max-w-[50%] translate-x-[-50%] translate-y-[-50%] flex-col'>
      <div className='mb-3 flex flex-col items-center space-y-1'>
        <h1 className='text-2xl font-bold text-gray-12'>Find your community on Accord</h1>
        <span className='text-sm text-gray-12'>
          From gaming, to music, to learning, there&apos;s a place for you.
        </span>
      </div>
      <GuildBrowserSearchInput />
    </div>
  </div>
);
