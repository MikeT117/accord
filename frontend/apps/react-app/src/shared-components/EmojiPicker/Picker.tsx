import { lazy, Suspense } from 'react';
import { Emoji } from '../../types';
const Picker = lazy(() => import('@emoji-mart/react'));

const EmojiPicker = (props: { onEmojiSelect: (emoji: Emoji) => void }) => {
  return (
    <Suspense fallback={<></>}>
      <Picker {...props} />
    </Suspense>
  );
};

export default EmojiPicker;
