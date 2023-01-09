import { ReactNode } from 'react';

export const MainContentBodyLayout = ({ children }: { children: ReactNode }) => (
  <div className='overflow-y-auto bg-gray-2 [grid-area:main-content-body]'>{children}</div>
);
