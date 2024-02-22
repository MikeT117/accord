import { Root, Thumb, SwitchProps } from '@radix-ui/react-switch';
import { forwardRef } from 'react';

export const Switch = forwardRef<
    HTMLButtonElement,
    SwitchProps & React.RefAttributes<HTMLButtonElement>
>(({ checked, ...props }, ref) => {
    return (
        <Root
            className={`flex h-[20px] w-[34px] shrink-0 items-center rounded-full transition-colors ease-in-out ${
                checked ? 'bg-indigo-9' : 'bg-grayA-9'
            }`}
            checked={checked}
            {...props}
            ref={ref}
        >
            <Thumb className='h-[16px] w-[16px] shrink-0 rounded-full bg-gray-12 transition-all ease-in-out [&[data-state="checked"]]:translate-x-[16px] [&[data-state="unchecked"]]:translate-x-[2px]' />
        </Root>
    );
});

Switch.displayName = 'Switch';
