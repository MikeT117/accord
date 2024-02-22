import { Item, ContextMenuItemProps } from '@radix-ui/react-context-menu';
import { cva, VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const contextMenuItemStyles = cva(
    'flex items-center justify-between rounded-md focus:outline-none cursor-pointer text-sm whitespace-nowrap font shrink-0 px-2 py-1.5 text-white',
    {
        variants: {
            intent: {
                primary: 'hover:bg-indigoA-10 active:bg-indigoA-11',
                warning: 'hover:bg-yellowA-10 active:bg-yellowA-11 hover:text-black',
                danger: 'hover:bg-redA-10 active:bg-redA-11',
                success: 'hover:bg-mintA-10 active:bg-mintA-11 hover:text-black',
            },
            fullWidth: {
                true: 'w-full',
                false: 'w-min',
            },
            isActive: {
                true: '',
                false: '',
            },
        },
        defaultVariants: {
            intent: 'primary',
            fullWidth: false,
            isActive: false,
        },
    },
);

export interface ContextMenuItemCVAProps
    extends ContextMenuItemProps,
        VariantProps<typeof contextMenuItemStyles> {}

export const ContextMenuItem = forwardRef<HTMLDivElement, ContextMenuItemCVAProps>(
    (
        { className = '', fullWidth = false, intent = 'primary', isActive = false, ...props },
        ref,
    ) => {
        return (
            <Item
                className={contextMenuItemStyles({ class: className, fullWidth, intent, isActive })}
                ref={ref}
                {...props}
            />
        );
    },
);

ContextMenuItem.displayName = 'ContextMenuItem';
