import { useEffect } from 'react';
import { toastStore } from '@/shared-components/Toast';
import { useClipboard } from './useClipboard';
import { useI18nContext } from '../i18n/i18n-react';

export const useInviteLinkCopy = () => {
    const { LL } = useI18nContext();
    const { isError, isSuccess, onCopy } = useClipboard();

    useEffect(() => {
        if (isSuccess) {
            toastStore.create({
                title: LL.Toasts.Titles.InviteLinkCopied(),
                type: 'SUCCESS',
                duration: 3000,
            });
        } else if (isError) {
            toastStore.create({
                title: LL.Toasts.Titles.InviteLinkCopyFailed(),
                type: 'ERROR',
                duration: 3000,
            });
        }
    }, [isSuccess, isError]);

    return onCopy;
};
