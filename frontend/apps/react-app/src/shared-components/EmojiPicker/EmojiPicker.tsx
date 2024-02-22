import { lazy, Suspense } from 'react';
import { Emoji } from '../../types';
const Picker = lazy(() => import('@emoji-mart/react'));

export const EmojiPicker = ({ onEmojiSelect }: { onEmojiSelect: (emoji: Emoji) => void }) => (
    <Suspense fallback={<></>}>
        <Picker set='twitter' onEmojiSelect={onEmojiSelect} />
    </Suspense>
);
