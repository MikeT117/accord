import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { forwardRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { mergeRefs } from 'react-merge-refs';
import { fullscreenImagePreviewActions } from './stores/useFullscreenImagePreviewStore';

const IDLE = 'IDLE';
const LOADING = 'LOADING';
const SUCCESS = 'SUCCESS';
const ERROR = 'ERROR';

type ImageLoadingStatus = typeof IDLE | typeof LOADING | typeof SUCCESS | typeof ERROR;

export const Image = forwardRef<
  HTMLDivElement,
  {
    isActionable?: boolean;
    src?: string | null;
    h?: string;
    w?: string;
  }
>(({ src, h = '180px', w = '320px', isActionable = true }, ref) => {
  const [status, set] = useState<ImageLoadingStatus>(IDLE);

  const isIdle = status === IDLE;
  const isLoading = status === LOADING;
  const isSuccess = status === SUCCESS;
  const isError = status === ERROR;

  const { ref: inViewRef } = useInView({
    threshold: 0.5,
    onChange(inView) {
      if (inView && isIdle) {
        set(LOADING);
      }
    },
  });

  const handleImageOnLoad = () => set(SUCCESS);
  const handleImageOnError = () => set(ERROR);

  const handleImageOnClick = () => {
    if (isSuccess && isActionable) {
      fullscreenImagePreviewActions.setSrc(src ?? '');
    }
  };

  if (isError) {
    return (
      <div
        ref={mergeRefs([ref, inViewRef])}
        className='flex items-center justify-center rounded-md bg-grayA-3'
        style={{ height: h, width: w }}
      >
        <ExclamationTriangleIcon className='h-8 w-8 text-gray-11' />
      </div>
    );
  }

  return (
    <>
      {(isIdle || isLoading) && (
        <div
          ref={mergeRefs([ref, inViewRef])}
          className='animate-pulse overflow-hidden bg-grayA-3'
          style={{ height: h, width: w }}
        />
      )}
      {(isLoading || isSuccess) && (
        <img
          ref={mergeRefs([ref, inViewRef])}
          src={src ?? ''}
          onClick={handleImageOnClick}
          className={`rounded-md outline-none ring-0 ${isLoading ? 'invisible' : 'visible'} ${
            isActionable ? 'cursor-pointer' : ''
          }`}
          style={{ maxHeight: h, maxWidth: w }}
          onLoad={handleImageOnLoad}
          onError={handleImageOnError}
        />
      )}
    </>
  );
});

Image.displayName = 'Image';
