import { Provider, ToastViewport } from '@radix-ui/react-toast';
import { ReactNode } from 'react';
import { ToastsList } from './ToastsList';

export const ToastsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider duration={Infinity}>
      {children}
      <ToastsList />
      <ToastViewport className='max-w-screen fixed bottom-4 right-4 z-[9999] m-0 flex w-[390px] list-none flex-col gap-1 outline-none' />
    </Provider>
  );
};
