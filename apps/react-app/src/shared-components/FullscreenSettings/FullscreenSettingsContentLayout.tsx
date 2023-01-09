import { ReactNode } from 'react';

export const FullscreenSettingsContentLayout = ({ children }: { children: ReactNode }) => (
  <div className='relative flex grow basis-[760px] flex-col bg-gray-2'>
    <div className='relative flex h-full max-w-[800px] flex-col pr-16'>{children}</div>
  </div>
);
