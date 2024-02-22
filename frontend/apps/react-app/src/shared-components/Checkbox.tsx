import { Check } from '@phosphor-icons/react';
import { Root, Indicator } from '@radix-ui/react-checkbox';
import { forwardRef } from 'react';

export const Checkbox = forwardRef<
    HTMLButtonElement,
    { isChecked: boolean; className?: string; onChange?: () => void }
>(({ isChecked, className = '', onChange }, ref) => (
    <Root
        className={`flex h-[18px] w-[18px] items-center justify-center overflow-hidden rounded-md ring-1 ${
            isChecked ? 'bg-indigo-9 ring-indigoA-7' : 'ring-grayA-7'
        } ${className}`}
        checked={isChecked}
        onChange={onChange}
        ref={ref}
    >
        <Indicator>
            <Check size={16} className='text-gray-12' />
        </Indicator>
    </Root>
));

Checkbox.displayName = 'Checkbox';
