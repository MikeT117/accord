import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { Button } from './Button';

export const AccordError = () => {
  const handleReloadButtonClick = () => {
    window.location.reload();
  };
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center'>
      <ExclamationCircleIcon className='h-48 w-48 shrink-0 fill-red-11' />
      <div className='flex flex-col items-center justify-center space-y-2'>
        <span className='text-2xl font-semibold text-gray-12'>Oops! Something went wrong.</span>
        <span className='font-medium text-gray-11'>
          Accord encountered an error, see the console for technical details.
        </span>
        <Button onClick={handleReloadButtonClick} fullWidth>
          Reload
        </Button>
      </div>
    </div>
  );
};
