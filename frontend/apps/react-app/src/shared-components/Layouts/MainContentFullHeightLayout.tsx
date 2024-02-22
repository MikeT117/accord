import { ReactNode } from 'react';

export const MainSidebarContentFullHeightLayout = ({ children }: { children: ReactNode }) => (
    <div className='col-start-3 col-end-4 row-start-1 row-end-3 flex flex-col items-center overflow-y-auto bg-grayA-5 p-10'>
        {children}
    </div>
);
