import { lazy, Suspense } from 'react';
import type { Emoji } from '@accord/common';
const Picker = lazy(() => import('@emoji-mart/react'));

export default function EmojiPicker(props: { onEmojiSelect: (emoji: Emoji) => void }) {
  return (
    <Suspense fallback={<></>}>
      <Picker {...props} />
    </Suspense>
  );
}
