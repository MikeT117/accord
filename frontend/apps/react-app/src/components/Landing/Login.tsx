import { ReactElement, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useExtractTokensFromQueryParams } from '@/shared-hooks';
import { FullScreenLoadingSpinner } from '@/shared-components/LoadingSpinner';
import { GithubIcon } from '@/assets/Icons/GithubIcon';
import { useHasSession } from '@/shared-hooks';
import { Button } from '@/shared-components/Button';
import { env } from '../../env';

const OAuthLoginButton = ({
  provider,
  url,
  icon,
}: {
  icon?: ReactElement;
  url: string;
  provider: 'GitHub' | 'GitLab';
}) => (
  <Button
    onClick={() => {
      window.location.href = url;
    }}
  >
    {icon}
    <span className='ml-3'>{`Sign In With ${provider}`}</span>
  </Button>
);

export const Login = () => {
  const hasSession = useHasSession();
  const [sessionChecked, setSessionChecked] = useState(false);
  useExtractTokensFromQueryParams();

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
    <div className='flex h-screen w-screen'>
      <div className='m-auto flex flex-col'>
        <h1 className='mb-6 text-3xl font-bold'>Accord 👋</h1>
        <OAuthLoginButton
          provider='GitHub'
          icon={<GithubIcon className='h-5 w-5 fill-white' />}
          url={`https://${env.apiUrl}/v1/auth/github`}
        />
      </div>
    </div>
  );
};
