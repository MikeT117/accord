import { Root, ToastTitle, ToastDescription, ToastAction } from '@radix-ui/react-toast';
import { useCallback } from 'react';
import { toastStore, useToastsStore } from './stores/useToastsStore';
import { IconButton } from '@/shared-components/IconButton';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export const ToastsList = () => {
  const toasts = useToastsStore(useCallback((s) => s.toasts, []));
  return (
    <>
      {toasts.map((t) => (
        <Root
          duration={t.duration}
          onOpenChange={() => toastStore.dismissToast(t.id)}
          key={t.id}
          className={`flex items-center rounded-md border px-3 py-2.5 ${(() => {
            if (t.type === 'SUCCESS') {
              return 'border-mint-7 bg-mint-1';
            }
            if (t.type === 'ERROR') {
              return 'border-red-7 bg-red-1';
            }
            if (t.type === 'INFO') {
              return 'border-indigo-7 bg-indigo-1';
            }
            if (t.type === 'WARNING') {
              return 'border-yellow-7 bg-yellow-1';
            }
          })()}`}
        >
          <div className='mr-3 flex items-center'>
            {t.type === 'ERROR' && <ExclamationTriangleIcon className='h-7 w-7 text-red-11' />}
            {t.type === 'INFO' && <InformationCircleIcon className='h-7 w-7 text-indigo-11' />}
            {t.type === 'SUCCESS' && <CheckCircleIcon className='h-7 w-7 text-mint-11' />}
            {t.type === 'WARNING' && <ExclamationTriangleIcon className='h-7 w-7 text-yellow-11' />}
          </div>
          <div className='mr-auto flex flex-col items-start space-y-1'>
            <ToastTitle className='text-sm font-semibold text-gray-12'>{t.title}</ToastTitle>
            {t.description && (
              <ToastDescription className='text-xs font-medium text-gray-11'>
                {t.description}
              </ToastDescription>
            )}
          </div>
          <ToastAction
            asChild
            onClick={() => toastStore.dismissToast(t.id)}
            altText='Dismiss Notification'
          >
            <IconButton
              intent={(() => {
                switch (t.type) {
                  case 'SUCCESS':
                    return 'success';
                  case 'ERROR':
                    return 'danger';
                  case 'INFO':
                    return 'primary';
                  case 'WARNING':
                    return 'warning';
                  default:
                    return 'secondary';
                }
              })()}
            >
              <XMarkIcon className='h-5 w-5' />
            </IconButton>
          </ToastAction>
        </Root>
      ))}
    </>
  );
};
