import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionStore } from '@/shared-stores/sessionStore';
import { useReqQueryParams } from './useReqQueryParams';

export const useExtractTokensFromQueryParams = () => {
  const params = useReqQueryParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accesstoken = params.get('accesstoken');
    const refreshtoken = params.get('refreshtoken');
    const error = params.get('error');

    if (error || !accesstoken || !refreshtoken) {
      navigate('/');
    } else {
      sessionStore.setSession({ accesstoken, refreshtoken });
    }
  }, [params, navigate]);
};
