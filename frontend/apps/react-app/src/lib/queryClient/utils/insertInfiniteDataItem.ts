import { InfiniteData } from '@tanstack/react-query';

export const insertInfiniteDataItem = <T = unknown>(
  data: InfiniteData<T[]> | undefined,
  item: T | T[],
) => {
  if (!data) {
    return;
  }

  const flatPages = Array.isArray(item)
    ? [...item, ...data.pages.flat()]
    : [item, ...data.pages.flat()];
  const pages = flatPages.reduce((result: InfiniteData<T[]>['pages'], item, i) => {
    const index = Math.floor(i / 50);
    if (!result[index]) {
      result[index] = [];
    }
    result[index].push(item);
    return result;
  }, []);
  const pageParams = pages.map((page, i) => {
    if (i === 0) {
      return;
    } else if (page.length < 50) {
      return page.length + i * 50;
    } else {
      return i * 50;
    }
  });
  return { pages, pageParams };
};
