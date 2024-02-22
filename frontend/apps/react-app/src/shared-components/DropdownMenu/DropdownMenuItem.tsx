import { Item, DropdownMenuItemProps } from '@radix-ui/react-dropdown-menu';
import { cva, VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const dropdownMenuItemStyles = cva(
    'flex items-center justify-between rounded-md focus:outline-none cursor-pointer text-sm font-medium whitespace-nowrap font shrink-0 px-2 py-1.5 text-white',
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

export interface DropdownMenuItemCVAProps
    extends DropdownMenuItemProps,
        VariantProps<typeof dropdownMenuItemStyles> {}

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemCVAProps>(
    (
        {
            isActive = false,
            intent = 'primary',
            fullWidth = false,
            className = '',
            children,
            ...props
        },
        ref,
    ) => (
        <Item
            className={dropdownMenuItemStyles({ fullWidth, intent, isActive, class: className })}
            ref={ref}
            {...props}
        >
            {children}
        </Item>
    ),
);

DropdownMenuItem.displayName = 'DropdownMenuItem';
