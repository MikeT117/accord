import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useHasSession } from '@/shared-hooks';

export const WaitForAuth = ({ children }: { children: ReactNode }) => {
  const hasSession = useHasSession();
  return hasSession ? <>{children}</> : <Navigate to='/' replace={true} />;
};
