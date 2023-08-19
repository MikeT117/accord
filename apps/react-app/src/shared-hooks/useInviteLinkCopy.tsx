import { useEffect } from 'react';
import { toastStore } from '@/shared-components/Toast';
import { useClipboard } from './useClipboard';

export const useInviteLinkCopy = () => {
  const { isError, isSuccess, onCopy } = useClipboard();

  useEffect(() => {
    if (isError) {
      toastStore.addToast({ title: 'Failure copying link', type: 'ERROR', duration: 3000 });
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      toastStore.addToast({ title: 'Link copied to clipboard', type: 'SUCCESS', duration: 3000 });
    }
  }, [isSuccess]);

  return onCopy;
};
