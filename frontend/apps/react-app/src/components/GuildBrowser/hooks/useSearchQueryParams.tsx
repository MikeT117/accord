import { useReqQueryParams } from '@/shared-hooks';

export const useSearchQueryParams = () => {
  const params = useReqQueryParams();
  return {
    query: params.get('query'),
    offset: params.get('offset'),
    limit: params.get('limit'),
  };
};
