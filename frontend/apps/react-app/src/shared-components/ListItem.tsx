import { cva, VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const listItemStyles = cva('group flex items-center w-full text-sm', {
    variants: {
        intent: {
            primary: 'text-indigo-11',
            secondary: 'text-gray-11',
            danger: 'text-red-11',
            success: 'text-mint-11',
            warning: 'text-yellow-11',
        },
        isActive: {
            true: '',
            false: '',
        },
        isActionable: {
            true: 'cursor-pointer',
            false: '',
        },
        isHoverable: {
            true: '',
            false: '',
        },
        isRounded: {
            true: 'rounded-md',
            false: '',
        },
        baseBg: {
            true: '',
            false: '',
        },
        padding: {
            sm: 'py-0.5 px-1.5',
            md: 'py-1.5 px-2.5',
            lg: 'py-2.5 px-4',
        },
    },
    compoundVariants: [
        { intent: 'primary', isActive: true, class: '!bg-indigoA-5' },
        { intent: 'secondary', isActive: true, class: '!bg-grayA-5 !text-gray-12' },
        { intent: 'danger', isActive: true, class: '!bg-redA-5' },
        { intent: 'warning', isActive: true, class: '!bg-yellowA-5' },
        { intent: 'success', isActive: true, class: '!bg-mintA-5' },

        { intent: 'primary', isHoverable: true, class: 'hover:bg-indigoA-4' },
        { intent: 'secondary', isHoverable: true, class: ' hover:bg-grayA-4' },
        { intent: 'danger', isHoverable: true, class: ' hover:bg-redA-4' },
        { intent: 'warning', isHoverable: true, class: 'hover:bg-yellowA-4' },
        { intent: 'success', isHoverable: true, class: ' hover:bg-mintA-4' },

        { intent: 'primary', isActionable: true, class: 'active:!bg-indigoA-5 ' },
        { intent: 'secondary', isActionable: true, class: 'active:!bg-grayA-5 ' },
        { intent: 'danger', isActionable: true, class: 'active:!bg-redA-5 ' },
        { intent: 'warning', isActionable: true, class: 'active:!bg-yellowA-5 ' },
        { intent: 'success', isActionable: true, class: 'active:!bg-mintA-5 ' },

        { intent: 'primary', baseBg: true, class: 'bg-indigoA-3' },
        { intent: 'secondary', baseBg: true, class: 'bg-grayA-3' },
        { intent: 'danger', baseBg: true, class: 'bg-redA-3' },
        { intent: 'warning', baseBg: true, class: 'bg-yellowA-3' },
        { intent: 'success', baseBg: true, class: 'bg-mintA-3' },
    ],
    defaultVariants: {
        intent: 'primary',
        isActive: false,
        isActionable: false,
        isHoverable: true,
        isRounded: true,
        baseBg: true,
        padding: 'md',
    },
});

export interface ListItemProps
    extends React.LiHTMLAttributes<HTMLLIElement>,
        VariantProps<typeof listItemStyles> {
    isActive?: boolean;
}

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
    (
        {
            intent = 'primary',
            isActive = false,
            isActionable = false,
            isHoverable = true,
            isRounded = true,
            baseBg = true,
            padding = 'md',
            className = '',
            ...props
        },
        ref,
    ) => {
        return (
            <li
                role={isActionable ? 'button' : 'listitem'}
                className={listItemStyles({
                    intent,
                    isActive,
                    isActionable,
                    isHoverable,
                    isRounded,
                    baseBg,
                    padding,
                    class: className,
                })}
                ref={ref}
                {...props}
            />
        );
    },
);

ListItem.displayName = 'ListItem';
