import { Root, ToastTitle, ToastDescription, ToastAction } from '@radix-ui/react-toast';
import { toastStore, useToastStore } from './stores/toastStore';
import { IconButton } from '@/shared-components/IconButton';
import { XCircle, Info, CheckCircle, Warning, X } from '@phosphor-icons/react';
import { VariantProps, cva } from 'class-variance-authority';

const toastStyles = cva('flex items-center rounded-md border px-3 py-2.5', {
    variants: {
        intent: {
            SUCCESS: 'border-mint-7 bg-mint-1',
            ERROR: 'border-red-7 bg-red-1',
            INFO: 'border-indigo-7 bg-indigo-1',
            WARNING: 'border-yellow-7 bg-yellow-1',
        },
    },
    defaultVariants: {
        intent: 'INFO',
    },
});

export interface ButtonProps
    extends React.LiHTMLAttributes<HTMLLIElement>,
        VariantProps<typeof toastStyles> {}

export const ToastsList = () => {
    const toasts = useToastStore((s) => s.toasts);
    return toasts.map((t) => (
        <Root
            duration={t.duration}
            onOpenChange={() => toastStore.dismiss(t.id)}
            key={t.id}
            className={toastStyles({ intent: t.type })}
        >
            <div className='mr-3 flex items-center'>
                {t.type === 'ERROR' && <XCircle size={28} className='text-red-11' />}
                {t.type === 'INFO' && <Info size={28} className='text-indigo-11' />}
                {t.type === 'SUCCESS' && <CheckCircle size={28} className='text-mint-11' />}
                {t.type === 'WARNING' && <Warning size={28} className='text-yellow-11' />}
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
                onClick={() => toastStore.dismiss(t.id)}
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
                    <X size={20} />
                </IconButton>
            </ToastAction>
        </Root>
    ));
};
