import { ReactNode } from 'react';

export const MainContentFooterLayout = ({ children }: { children: ReactNode }) => (
  <div className='bg-gray-2 px-4 pb-4 [grid-area:main-content-footer]'>{children}</div>
);
