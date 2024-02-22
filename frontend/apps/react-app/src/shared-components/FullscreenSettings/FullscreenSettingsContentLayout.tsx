import { ReactNode } from 'react';

export const FullscreenSettingsContentLayout = ({ children }: { children: ReactNode }) => (
    <div className='relative flex grow basis-[760px] flex-col bg-gray-4 overflow-auto'>
        <div className='relative flex h-full max-w-[80%] flex-col pr-16'>{children}</div>
    </div>
);
