import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toastStore } from '../../shared-components/Toast';
import { AxiosError } from 'axios';
import { AccordRESTAPIResponse, AccordRESTAPIUnsuccessfulResponse } from '../axios';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry(failureCount, error) {
                if (error instanceof AxiosError) {
                    if (error.response?.status && error.response.status >= 500) {
                        return failureCount < 5;
                    }
                }
                return false;
            },
            retryDelay(failureCount) {
                return failureCount * 2500;
            },
            retryOnMount: false,
        },
        mutations: {
            retry: false,
        },
    },
    mutationCache: new MutationCache({
        onError: (error) => {
            console.error(error);

            let description = '';

            if (error instanceof AxiosError) {
                description =
                    (error as AxiosError<AccordRESTAPIResponse & AccordRESTAPIUnsuccessfulResponse>)
                        .response?.data.detail ?? '';
            }

            toastStore.create({
                title: 'Request failed',
                type: 'ERROR',
                description,
                duration: Infinity,
            });
        },
    }),
    queryCache: new QueryCache({
        onError: (error) => {
            console.error(error);

            let description = '';

            if (error instanceof AxiosError) {
                description =
                    (error as AxiosError<AccordRESTAPIResponse & AccordRESTAPIUnsuccessfulResponse>)
                        .response?.data.detail ?? '';
            }

            toastStore.create({
                title: 'Request failed',
                type: 'ERROR',
                description,
                duration: Infinity,
            });
        },
    }),
});
