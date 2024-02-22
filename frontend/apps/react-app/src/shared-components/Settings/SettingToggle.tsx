import { forwardRef } from 'react';
import { Switch } from '@/shared-components/Switch';

export const SettingToggle = forwardRef<
    HTMLDivElement,
    {
        onChange: () => void;
        isChecked: boolean;
        label: string;
        helperText: string;
        isDisabled?: boolean;
    }
>(({ onChange, isChecked, label, helperText, isDisabled = false }, ref) => (
    <div
        className='flex w-full cursor-pointer select-none items-center justify-between rounded-md bg-grayA-3 p-3'
        onClick={onChange}
        ref={ref}
    >
        <div className='flex flex-col space-y-1'>
            <label className='pointer-events-none text-sm font-medium text-gray-12'>{label}</label>
            <span className='text-xs text-gray-11'>{helperText}</span>
        </div>
        <Switch checked={isChecked} disabled={isDisabled} />
    </div>
));

SettingToggle.displayName = 'SettingToggle';
