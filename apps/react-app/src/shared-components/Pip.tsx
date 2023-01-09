import { ReactNode } from 'react';

export const Pip = ({ children }: { children: ReactNode }) => {
  return (
    <span className='whitespace-nowrap rounded bg-mintA-3 px-1.5 py-0.5 text-xs text-mint-11'>
      {children}
    </span>
  );
};
