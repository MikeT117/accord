import { useGlobalKeyListener } from '@/shared-hooks';
import { Dialog } from '@/shared-components/Dialog';
import { Image } from './Image.tsx';
import { imageStore, useImageStore } from './stores/imageStore.ts';

const ImageViewerContent = () => {
    const src = useImageStore((s) => s.src);
    useGlobalKeyListener({ isDisabled: !!src, key: 'Escape', onKeyPress: imageStore.close });
    return src ? <Image h='80vh' w='80vw' src={src!} isActionable={false} /> : null;
};

export const ImageViewer = () => {
    const isOpen = useImageStore((s) => s.isOpen);
    return (
        <Dialog
            isOpen={isOpen}
            onClose={imageStore.close}
            size='unsized'
            className='max-h-[80vh] max-w-[80vw]'
        >
            <ImageViewerContent />
        </Dialog>
    );
};
