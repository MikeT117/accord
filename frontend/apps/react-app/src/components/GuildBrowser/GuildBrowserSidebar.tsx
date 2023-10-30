import {
  AcademicCapIcon,
  BeakerIcon,
  HomeIcon,
  MusicalNoteIcon,
  PuzzlePieceIcon,
  RectangleGroupIcon,
  TvIcon,
} from '@heroicons/react/24/solid';
import { useCallback } from 'react';
import { useGetGuildCategoriesQuery } from '@/api/guild/getGuildCategories';
import { MainSidebarHeaderLayout, MainSidebarContentLayout } from '@/shared-components/Layouts';
import { ListItem } from '@/shared-components/ListItem';
import { guildCategoryFilterStore, useGuildCategoryFilter } from './stores/useGuildCategoryFilter';

const { setGuildCategoryId } = guildCategoryFilterStore;

export const GuildBrowserSidebar = () => {
  const guildCategoryId = useGuildCategoryFilter(useCallback((s) => s.guildCategoryId, []));
  const { data } = useGetGuildCategoriesQuery();

  if (!data) {
    return null;
  }

  return (
    <>
      <MainSidebarHeaderLayout>
        <h1 className='mx-4 mr-auto text-2xl font-bold text-gray-12'>Discover</h1>
      </MainSidebarHeaderLayout>
      <MainSidebarContentLayout>
        <ul className='space-y-1 px-2 py-2'>
          <ListItem
            isActive={!guildCategoryId}
            onClick={() => setGuildCategoryId(undefined)}
            intent='secondary'
            className='space-x-2'
            baseBg={false}
            padding='lg'
            isActionable
          >
            <HomeIcon className='h-5 w-5' />
            <span>Home</span>
          </ListItem>
          {data?.map((gc) => (
            <ListItem
              key={gc.id}
              isActive={gc.id === guildCategoryId}
              onClick={() => setGuildCategoryId(gc.id)}
              intent='secondary'
              className='space-x-2'
              baseBg={false}
              padding='lg'
              isActionable
            >
              {gc.name === 'Music' && <MusicalNoteIcon className='h-5 w-5' />}
              {gc.name === 'General' && <RectangleGroupIcon className='h-5 w-5' />}
              {gc.name === 'Education' && <AcademicCapIcon className='h-5 w-5' />}
              {gc.name === 'Entertainment' && <TvIcon className='h-5 w-5' />}
              {gc.name === 'Science & Tech' && <BeakerIcon className='h-5 w-5' />}
              {gc.name === 'Gaming' && <PuzzlePieceIcon className='h-5 w-5' />}
              <span>{gc.name}</span>
            </ListItem>
          ))}
        </ul>
      </MainSidebarContentLayout>
    </>
  );
};
