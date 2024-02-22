import { forwardRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { mergeRefs } from 'react-merge-refs';
import { imageStore } from './stores/imageStore.ts';
import { Warning } from '@phosphor-icons/react';

const FAILURE = -1;
const IDLE = 0;
const LOADING = 1;
const SUCCESS = 2;

export const Image = forwardRef<
    HTMLDivElement,
    {
        isActionable?: boolean;
        src?: string | null;
        h?: string;
        w?: string;
        className?: string;
    }
>(({ src, h = '180px', w = '320px', isActionable = true, className = '' }, ref) => {
    const [status, set] = useState(0);

    const { ref: inViewRef } = useInView({
        threshold: 0.5,
        onChange(inView) {
            if (inView && isIdle) {
                set(LOADING);
            }
        },
    });

    const isIdle = status === IDLE;
    const isLoading = status === LOADING;
    const isSuccess = status === SUCCESS;
    const isError = status === FAILURE;

    const handleImageOnLoad = () => set(SUCCESS);
    const handleImageOnError = () => set(FAILURE);

    const handleImageOnClick = () => {
        if (!isSuccess || !isActionable || !src) {
            return;
        }

        imageStore.open(src);
    };

    if (isError) {
        return (
            <div
                ref={mergeRefs([ref, inViewRef])}
                className={`flex items-center justify-center rounded-md bg-redA-3 border border-redA-4 ${className}`}
                style={{ height: h, width: w }}
            >
                <Warning className='text-redA-6' />
            </div>
        );
    }

    return (
        <>
            {(isIdle || isLoading) && (
                <div
                    ref={mergeRefs([ref, inViewRef])}
                    className={`animate-pulse overflow-hidden bg-grayA-3 ${className}`}
                    style={{ height: h, width: w }}
                />
            )}
            {(isLoading || isSuccess) && (
                <img
                    ref={mergeRefs([ref, inViewRef])}
                    src={src ?? ''}
                    onClick={handleImageOnClick}
                    className={`rounded-md outline-none ring-0 ${
                        isLoading ? 'invisible' : 'visible'
                    } ${isActionable ? 'cursor-pointer' : ''} ${className}`}
                    style={{ maxHeight: h, maxWidth: w }}
                    onLoad={handleImageOnLoad}
                    onError={handleImageOnError}
                />
            )}
        </>
    );
});

Image.displayName = 'Image';
