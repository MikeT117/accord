import { cva, VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { DefaultTooltip } from './DefaultTooltip';

const iconButtonStyles = cva(
    'flex group shrink-0 grow-0 items-center justify-center focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
    {
        variants: {
            intent: {
                primary: 'hover:bg-indigoA-5 active:bg-indigoA-6 text-indigoA-11',
                primarySolid: 'hover:bg-indigo-10 active:bg-indigoA-11 text-white',
                secondary: 'hover:bg-grayA-5 active:bg-grayA-6 text-grayA-11 hover:text-white',
                secondarySolid: 'hover:bg-gray-10 active:bg-gray-11 text-white',
                danger: 'hover:bg-redA-5 active:bg-redA-6 text-redA-11',
                dangerSolid: 'hover:bg-red-10 active:bg-red-11 text-white',
                success: 'hover:bg-mintA-5 active:bg-mintA-6 text-mintA-11',
                successSolid: 'hover:bg-mint-10 active:bg-mint-11 text-black',
                warning: 'hover:bg-yellowA-5 active:bg-yellowA-6 text-yellowA-11',
                warningSolid: 'hover:bg-yellow-10 active:bg-yellow-11 text-black',
                logo: 'hover:bg-indigo-10 active:bg-indigoA-11 text-grayA-11 hover:text-white',
                unstyled: 'text-gray-11 hover:text-gray-12',
            },
            padding: {
                xxs: 'p-0',
                xs: 'p-0.5',
                s: 'p-1.5',
                m: 'p-2.5',
                l: 'p-3.5',
            },
            shape: {
                unstyled: '',
                squircle: 'rounded-md',
                circle: 'rounded-full',
            },
            baseBg: {
                true: '',
                false: '',
            },
        },
        compoundVariants: [
            { intent: 'primary', baseBg: true, class: 'bg-indigoA-3' },
            { intent: 'primarySolid', baseBg: true, class: 'bg-indigo-9' },
            { intent: 'secondary', baseBg: true, class: 'bg-grayA-3' },
            { intent: 'secondarySolid', baseBg: true, class: 'bg-gray-9' },
            { intent: 'danger', baseBg: true, class: 'bg-redA-3' },
            { intent: 'dangerSolid', baseBg: true, class: 'bg-red-9' },
            { intent: 'success', baseBg: true, class: 'bg-greenA-3' },
            { intent: 'successSolid', baseBg: true, class: 'bg-mint-9' },
            { intent: 'warning', baseBg: true, class: 'bg-yellowA-3' },
            { intent: 'warningSolid', baseBg: true, class: 'bg-yellow-9' },
            { intent: 'logo', baseBg: true, class: 'bg-grayA-3' },
        ],
        defaultVariants: {
            intent: 'primary',
            padding: 's',
            shape: 'circle',
            baseBg: true,
        },
    },
);

export interface IconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof iconButtonStyles> {}

export const IconButton = forwardRef<
    HTMLButtonElement,
    IconButtonProps & {
        tooltipText?: string;
        tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
        tooltipDelay?: number;
    }
>(
    (
        {
            intent = 'primary',
            padding = 's',
            shape,
            baseBg = true,
            tooltipText,
            tooltipPosition,
            tooltipDelay,
            className = '',
            ...props
        },
        ref,
    ) => {
        if (!tooltipText) {
            return (
                <button
                    className={`round ${iconButtonStyles({
                        intent,
                        padding,
                        shape,
                        baseBg,
                        class: className,
                    })}`}
                    {...props}
                    ref={ref}
                />
            );
        }

        return (
            <DefaultTooltip text={tooltipText} delay={tooltipDelay} position={tooltipPosition}>
                <button
                    className={`round ${iconButtonStyles({
                        intent,
                        padding,
                        shape,
                        baseBg,
                        class: className,
                    })}`}
                    {...props}
                    ref={ref}
                />
            </DefaultTooltip>
        );
    },
);

IconButton.displayName = 'IconButton';
