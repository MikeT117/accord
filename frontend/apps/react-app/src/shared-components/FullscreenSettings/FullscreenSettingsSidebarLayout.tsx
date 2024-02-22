import { ReactNode } from 'react';

export const FullscreenSettingsSidebarLayout = ({ children }: { children: ReactNode }) => (
    <div className='flex grow basis-[200px] justify-end bg-gray-2 py-12 px-5'>
        <div className='flex flex-col'>{children}</div>
    </div>
);
