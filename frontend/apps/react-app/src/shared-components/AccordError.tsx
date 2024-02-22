import { Warning } from '@phosphor-icons/react';
import { Button } from './Button';
import { useI18nContext } from '../i18n/i18n-react';

export const AccordError = () => {
    const { LL } = useI18nContext();
    const handleReloadButtonClick = () => {
        window.location.reload();
    };
    return (
        <div className='flex h-screen w-screen flex-col items-center justify-center'>
            <Warning size={192} className='shrink-0 fill-red-11' />
            <div className='flex flex-col items-center justify-center space-y-2'>
                <span className='text-2xl font-semibold text-gray-12'>{LL.General.Error()}</span>
                <span className='font-medium text-gray-11'>{LL.Hints.Error()}</span>
                <Button onClick={handleReloadButtonClick} fullWidth>
                    {LL.Actions.Reload()}
                </Button>
            </div>
        </div>
    );
};
