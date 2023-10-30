import { InfiniteData } from '@tanstack/react-query';

export const deleteInfiniteDataItem = <T = unknown>(
  data: InfiniteData<T[]> | undefined,
  filterFn: (item: T) => boolean,
) => {
  if (!data) {
    return;
  }
  const pages = data.pages.map((page) => page.filter(filterFn));
  const totalMessages = pages.reduce((res, item) => res + item.length, 0);

  if (totalMessages === 0) {
    return {
      pageParams: [],
      pages: [[]],
    };
  }

  const pageParams = pages.map((page, i) => {
    if (i === 0) {
      return null;
    } else if (page.length < 50) {
      return page.length + i * 50;
    } else {
      return i * 50;
    }
  });

  return { pages, pageParams };
};
