import { AtSymbolIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { MainContentHeaderLayout } from '@/shared-components/Layouts';
import { ReactNode } from 'react';
import { Channel } from '../../types';

export const Header = ({
  name,
  channelType,
  children,
}: Pick<Channel, 'name' | 'channelType'> & {
  children?: ReactNode;
}) => (
  <MainContentHeaderLayout>
    <div className='flex items-center space-x-1 text-gray-12'>
      {channelType !== 0 ? (
        <AtSymbolIcon className='h-5 w-5 stroke-2' />
      ) : (
        <HashtagIcon className='h-5 w-5 stroke-2' />
      )}
      <span className='text-lg font-medium'>{name}</span>
    </div>
    <div className='ml-auto flex items-center space-x-2'>{children}</div>
  </MainContentHeaderLayout>
);
