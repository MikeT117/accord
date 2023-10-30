import { InfiniteData } from '@tanstack/react-query';

export const updateInfiniteDataItem = <T = unknown>(
  data: InfiniteData<T[]> | undefined,
  mapFn: (item: T) => T,
) => {
  if (!data) {
    return;
  }
  return {
    pages: data.pages.map((page) => page.map(mapFn)),
    pageParams: data.pageParams,
  };
};
