import { useState } from 'react';
import { useGlobalKeyListener } from '@/shared-hooks';
import { Input } from '@/shared-components/Input';

export const InlineMessageEditor = ({
  content,
  onCloseEditor,
  onSaveChanges,
}: {
  content: string;
  onCloseEditor: () => void;
  onSaveChanges: (content: string) => void;
}) => {
  const [updatedContent, set] = useState(content);

  useGlobalKeyListener({
    isDisabled: false,
    onKeyPress: onCloseEditor,
    key: 'Escape',
  });

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!e.shiftKey && e.key === 'Enter') {
      onSaveChanges(updatedContent);
      onCloseEditor();
    }
  };

  return (
    <div className='flex flex-col items-center space-y-1'>
      <Input
        type='text'
        onKeyUp={handleKeyUp}
        onChange={(e) => set(e.currentTarget.value)}
        value={updatedContent}
      />
      <div className='flex w-full items-center space-x-1'>
        <button
          className='text-xs font-medium text-indigo-11 hover:underline'
          onClick={onCloseEditor}
        >
          Escape
        </button>
        <span className='text-xs font-light text-gray-11'>to cancel</span>
        <span className='text-xs text-gray-11'>|</span>
        <button
          className='text-xs font-medium text-indigo-11 hover:underline'
          onClick={() => onSaveChanges(updatedContent)}
        >
          Enter
        </button>
        <span className='text-xs font-light text-gray-11'>to save</span>
      </div>
    </div>
  );
};
