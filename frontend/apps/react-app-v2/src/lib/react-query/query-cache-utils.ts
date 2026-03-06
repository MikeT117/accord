import type { InfiniteData } from "@tanstack/react-query";
import { MAX_INFINITE_PAGE_LEN } from "./query-constants";

export const insertInfiniteDataItem = <T = unknown>(data: InfiniteData<T[]> | undefined, item: T | T[]) => {
    if (!data) {
        return;
    }

    const flatPages = Array.isArray(item) ? [...item, ...data.pages.flat()] : [item, ...data.pages.flat()];
    const pages = flatPages.reduce((result: InfiniteData<T[]>["pages"], item, i) => {
        const index = Math.floor(i / MAX_INFINITE_PAGE_LEN);
        if (!result[index]) {
            result[index] = [];
        }
        result[index].push(item);
        return result;
    }, []);
    const pageParams = pages.map((page, i) => {
        if (i === 0) {
            return;
        } else if (page.length < MAX_INFINITE_PAGE_LEN) {
            return page.length + i * MAX_INFINITE_PAGE_LEN;
        } else {
            return i * MAX_INFINITE_PAGE_LEN;
        }
    });
    return { pages, pageParams };
};

export const updateInfiniteDataItem = <T = unknown>(data: InfiniteData<T[]> | undefined, mapFn: (item: T) => T) => {
    if (!data) {
        return;
    }
    return {
        pages: data.pages.map((page) => page.map(mapFn)),
        pageParams: data.pageParams,
    };
};

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
            return;
        } else if (page.length < MAX_INFINITE_PAGE_LEN) {
            return page.length + i * MAX_INFINITE_PAGE_LEN;
        } else {
            return i * MAX_INFINITE_PAGE_LEN;
        }
    });

    return { pages, pageParams };
};
