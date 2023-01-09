import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '@/shared-components/Button';

export const UnsavedSettingsPrompt = ({
  isVisible,
  onDiscard,
  onSave,
}: {
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) => {
  if (!isVisible) {
    return null;
  }
  return (
    <div className='flex w-full items-center rounded-md bg-grayA-3 p-3'>
      <InformationCircleIcon className='h-8 w-8 text-yellowA-9' />
      <span className='ml-3 mr-auto text-sm font-semibold text-gray-12'>
        Careful - You have unsaved changes!
      </span>
      <div className='flex space-x-3'>
        <Button intent='link' padding='s' onClick={onDiscard}>
          Reset
        </Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  );
};
