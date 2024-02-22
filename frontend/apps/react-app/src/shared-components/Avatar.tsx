import { Root, Image, Fallback } from '@radix-ui/react-avatar';
import { cva, VariantProps } from 'class-variance-authority';
import { env } from '../env';

const avatarStyles = cva(
    'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full',
    {
        variants: {
            size: {
                xs: 'h-[22px] w-[22px]',
                sm: 'h-[28px] w-[28px]',
                md: 'h-[32px] w-[32px]',
                lg: 'h-[42px] w-[42px]',
                xl: 'h-[48px] w-[48px]',
                xxl: 'h-[60px] w-[60px]',
                '3xl': 'h-[72px] w-[72px]',
                '4xl': 'h-[88px] w-[88px]',
                '5xl': 'h-[92px] w-[92px]',
                '6xl': 'h-[108px] w-[108px]',
                '7xl': 'h-[116px] w-[116px]',
                '8xl': 'h-[132px] w-[132px]',
                '9xl': 'h-[164px] w-[164px]',
            },
        },
        defaultVariants: {
            size: 'sm',
        },
    },
);

export interface AvatarProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof avatarStyles> {
    className?: string;
    uri?: string | null;
    src?: string | null;
    fallback?: string;
    onClick?: () => void;
}

export const Avatar = ({
    uri,
    src = '',
    fallback = '',
    className = '',
    size = 'sm',
    onClick,
}: AvatarProps) => (
    <Root className={avatarStyles({ size, className })} onClick={onClick}>
        {(uri || src) && (
            <Image src={uri ?? env.cloudinaryResUrl + src} className='h-full w-full object-cover' />
        )}
        <Fallback className='flex h-full w-full items-center justify-center bg-grayA-3 font-medium'>
            {fallback}
        </Fallback>
    </Root>
);
