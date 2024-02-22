import { ReactNode } from 'react';

export const MainContentHeaderLayout = ({ children }: { children: ReactNode }) => (
    <div className='flex items-center mb-0.5 bg-grayA-4 px-4 [grid-area:main-content-header]'>
        {children}
    </div>
);
