import { ReactNode } from 'react';
import { ActiveVoiceChannel } from '@/components/AccordVoice';

export const MainSidebarContentLayout = ({ children }: { children: ReactNode }) => (
  <div className='flex flex-col overflow-y-auto border-r border-black [grid-area:main-sidebar-body]'>
    {children}
    <ActiveVoiceChannel />
  </div>
);
