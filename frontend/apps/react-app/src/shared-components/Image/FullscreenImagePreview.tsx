import { useCallback } from 'react';
import { useGlobalKeyListener } from '@/shared-hooks';
import { Dialog } from '@/shared-components/Dialog';
import { Image } from './Image';
import {
  fullscreenImagePreviewStore,
  useFullscreenImagePreviewStore,
} from './stores/useFullscreenImagePreviewStore';

const { toggleOpen } = fullscreenImagePreviewStore;

const FullscreenImagePreviewContent = () => {
  const src = useFullscreenImagePreviewStore(useCallback((s) => s.src, []));
  useGlobalKeyListener({ isDisabled: !!src, key: 'Escape', onKeyPress: toggleOpen });
  return src ? <Image h='80vh' w='80vw' src={src!} isActionable={false} /> : null;
};

export const FullscreenImagePreview = () => {
  const isOpen = useFullscreenImagePreviewStore(useCallback((s) => s.isOpen, []));
  return (
    <Dialog
      isOpen={isOpen}
      onClose={toggleOpen}
      size='unsized'
      className='max-h-[80vh] max-w-[80vw]'
    >
      <FullscreenImagePreviewContent />
    </Dialog>
  );
};
