import { useState, useEffect } from 'react';

export const useGenerateEmojiAndContentArrayFromContent = (content?: string | null) => {
  const [state, set] = useState<
    ({ emoji: string; str?: undefined } | { str: string; emoji?: undefined })[]
  >([]);

  useEffect(() => {
    if (content) {
      const arr = content
        .split(/(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))*/gu)
        .filter((s) => s?.length !== 0 && s != null);

      set(
        arr.map((s) =>
          s.match(/(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))*/gu)
            ? { emoji: s }
            : { str: s },
        ),
      );
    }
  }, [content]);

  return state;
};
