import { useEffect } from 'react';
import { toastActions } from '@/shared-components/Toast';
import { useClipboard } from './useClipboard';

export const useInviteLinkCopy = () => {
  const { isError, isSuccess, onCopy } = useClipboard();

  useEffect(() => {
    if (isError) {
      toastActions.addToast({ title: 'Failure copying link', type: 'ERROR', duration: 3000 });
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      toastActions.addToast({ title: 'Link copied to clipboard', type: 'SUCCESS', duration: 3000 });
    }
  }, [isSuccess]);

  return onCopy;
};
