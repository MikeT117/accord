import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared-components/Button';
import { useI18nContext } from '../../i18n/i18n-react';

export const ChannelNotFound = () => {
    const { LL } = useI18nContext();
    const navigate = useNavigate();

    return (
        <div className='flex h-full place-content-center place-items-center [grid-area:main-content-header/main-content-body/main-content-footer]'>
            <div className='flex flex-col items-center justify-center'>
                <h1 className='text-9xl font-semibold text-gray-11'>404</h1>
                <span className='mb-2 text-4xl font-medium text-gray-10'>
                    {LL.General.NotFound()}
                </span>
                <Button onClick={() => navigate(-1)} fullWidth>
                    {LL.Actions.GoBack()}
                </Button>
            </div>
        </div>
    );
};
