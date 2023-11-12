import { lazy, ReactNode } from 'react';
import { Popover } from '../Popover';
import { Emoji } from '../../types';

const EmojiPicker = lazy(() => import('./Picker'));

export const EmojiPickerPopover = ({
  triggerElem,
  onEmoji,
  ...props
}: {
  triggerElem: ReactNode;
  portalled?: boolean;
  children?: ReactNode;
  side?: 'top' | 'bottom' | 'right' | 'left';
  sideOffset?: number;
  alignOffset?: number;
  align?: 'start' | 'center' | 'end';
  onEmoji: (emoji: Emoji) => void;
}) => {
  return (
    <Popover tooltipText='Emoji Picker' triggerElem={triggerElem} {...props}>
      <EmojiPicker onEmojiSelect={onEmoji} />
    </Popover>
  );
};

export default EmojiPicker;
