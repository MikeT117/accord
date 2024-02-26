import { Item, Indicator } from '@radix-ui/react-radio-group';
import { ReactNode } from 'react';

export const RadioGroupItem = ({
    icon,
    name,
    description,
    value,
    isSelected,
}: {
    icon: ReactNode;
    name: string;
    description: string;
    value: string;
    isSelected: boolean;
}) => (
    <label
        htmlFor={`${name}-radio`}
        className={`flex cursor-pointer select-none items-center space-y-0 rounded-md py-2 px-3 ${
            isSelected ? 'bg-grayA-5' : 'bg-grayA-3 hover:bg-grayA-4'
        }`}
    >
        {icon}
        <div className='mx-3 flex w-full flex-col'>
            <span className='text-sm font-medium text-grayA-12'>{name}</span>
            <span className='text-xs text-grayA-10'>{description}</span>
        </div>
        <Item
            className='h-[16px] w-[16px] shrink-0 items-center rounded-full bg-transparent ring ring-grayA-11'
            value={value}
            id={`${name}-radio`}
        >
            <Indicator className='flex h-full w-full items-center justify-center after:block after:h-[10px] after:w-[10px] after:rounded-full after:bg-grayA-12' />
        </Item>
    </label>
);
