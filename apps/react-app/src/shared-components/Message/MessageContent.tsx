import { useGenerateEmojiAndContentArrayFromContent } from './hooks/useGenerateEmojiAndContentArray';

export const MessageContent = ({ content }: { content?: string | null }) => {
  const state = useGenerateEmojiAndContentArrayFromContent(content);
  if (state.length === 0) {
    return null;
  }

  if (state.length === 1 && state[0].emoji) {
    return <span className='text-5xl text-gray-11'>{state[0].emoji}</span>;
  }

  return (
    <>
      {state.map(({ emoji, str }, i) =>
        emoji ? (
          <span key={i} className='text-xl text-gray-12'>
            {emoji}
          </span>
        ) : (
          <span key={i} className='text-sm text-gray-12'>
            {str}
          </span>
        ),
      )}
    </>
  );
};
