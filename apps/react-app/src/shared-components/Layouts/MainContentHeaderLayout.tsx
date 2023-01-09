import { ReactNode } from 'react';

export const MainContentHeaderLayout = ({ children }: { children: ReactNode }) => (
  <div className='flex items-center border-b border-black bg-gray-2 px-4 [grid-area:main-content-header]'>
    {children}
  </div>
);
