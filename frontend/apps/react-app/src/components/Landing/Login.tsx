import { ReactElement, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useExtractTokensFromQueryParams } from '@/shared-hooks';
import { FullScreenLoadingSpinner } from '@/shared-components/LoadingSpinner';
import { useHasSession } from '@/shared-hooks';
import { Button } from '@/shared-components/Button';
import { env } from '../../env';
import { AccordLogo } from '../../assets/AccordLogo';
import { GithubLogo } from '../../assets/GithubLogo';
import { GitlabLogo } from '../../assets/GitlabLogo';
import { useI18nContext } from '../../i18n/i18n-react';

const providers = [
    {
        name: 'Github',
        icon: <GithubLogo className='h-7 w-7' />,
    },
    {
        name: 'Gitlab',
        icon: <GitlabLogo className='h-7 w-7' />,
    },
];

const OAuthLoginButton = ({
    icon,
    url,
    provider,
}: {
    className?: string;
    icon?: ReactElement;
    url: string;
    provider: string;
}) => {
    const { LL } = useI18nContext();
    return (
        <Button
            fullWidth={true}
            intent='secondaryAlpha'
            className='text-grayA-12'
            onClick={() => {
                window.location.href = url;
            }}
        >
            {icon}
            <span className='ml-2'>{LL.Actions.SignInWith({ provider })}</span>
        </Button>
    );
};

export const Login = () => {
    const { LL } = useI18nContext();
    const [sessionChecked, setSessionChecked] = useState(false);

    const hasSession = useHasSession();
    const error = useExtractTokensFromQueryParams();

    useEffect(() => {
        if (!hasSession) {
            setSessionChecked(true);
        }
    }, [hasSession]);

    if (hasSession) {
        return <Navigate to='/app' replace={true} />;
    }

    if (!sessionChecked) {
        return <FullScreenLoadingSpinner />;
    }

    return (
        <div className='flex h-screen w-screen bg-gray-3'>
            <div className='m-auto flex flex-col'>
                <div className='flex justify-evenly'>
                    <AccordLogo className='h-10 w-10' />
                    <h1 className='mb-6 text-3xl font-bold'>Accord</h1>
                </div>
                <div className='flex flex-col space-y-2'>
                    {providers.map(({ name, icon }, idx) => (
                        <OAuthLoginButton
                            key={idx}
                            provider={name}
                            icon={icon}
                            url={`https://${env.apiUrl}/v1/auth/${name.toLowerCase()}`}
                        />
                    ))}
                    {error && <p className='text-red-9'>{LL.Errors.Login({ error })}</p>}
                </div>
            </div>
        </div>
    );
};
