import { CheckIcon } from '@heroicons/react/24/outline';
import { Root, Indicator } from '@radix-ui/react-checkbox';
import { forwardRef } from 'react';

export const Checkbox = forwardRef<
  HTMLButtonElement,
  { isChecked: boolean; className?: string; onChange?: () => void }
>(({ isChecked, className = '', onChange }, ref) => {
  return (
    <Root
      className={`flex h-[18px] w-[18px] items-center justify-center overflow-hidden rounded ring-1 ${
        isChecked ? 'bg-indigo-9 ring-indigoA-7' : 'ring-grayA-7'
      } ${className}`}
      checked={isChecked}
      onChange={onChange}
      ref={ref}
    >
      <Indicator>
        <CheckIcon className='h-4 w-4 stroke-[3] text-gray-12' />
      </Indicator>
    </Root>
  );
});

Checkbox.displayName = 'Checkbox';
