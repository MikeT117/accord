import { ReactNode } from 'react';
import { ActiveVoiceChannel } from '@/components/AccordVoice';

export const MainSidebarContentLayout = ({ children }: { children: ReactNode }) => (
    <div className='flex flex-col overflow-y-auto bg-grayA-2 mr-0.5 [grid-area:main-sidebar-body]'>
        {children}
        <ActiveVoiceChannel />
    </div>
);
