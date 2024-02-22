import { VariantProps, cva } from 'class-variance-authority';
import { ReactNode } from 'react';

const pipStyles = cva(
    'whitespace-nowrap rounded-md bg-grayA-5 px-1.5 py-1 max-w-[120px] text-xs text-gray-12',
    {
        variants: {
            truncated: {
                true: 'truncate',
            },
        },
    },
);

export interface PipProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof pipStyles> {
    children: ReactNode;
}

export const Pip = ({ truncated, children }: PipProps) => (
    <span className={pipStyles({ truncated })}>{children}</span>
);
