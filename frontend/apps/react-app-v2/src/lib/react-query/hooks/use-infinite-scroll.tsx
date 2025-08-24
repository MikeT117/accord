import { useInView } from "react-intersection-observer";

export function useInfiniteScroll<T = any>(
    data: T[],
    hasPreviousPage: boolean,
    hasNextPage: boolean,
    fetchPreviousPage: () => void,
    fetchNextPage: () => void,
) {
    const [prevRef] = useInView({
        threshold: 0.01,
        onChange: (inView) => {
            if (!hasPreviousPage || !inView) {
                return;
            }
            fetchPreviousPage();
        },
    });

    const [nextRef] = useInView({
        threshold: 0.01,
        onChange: (inView) => {
            if (!hasNextPage || !inView) {
                return;
            }
            fetchNextPage();
        },
    });

    function infiniteScrollRef(index: number, elem: HTMLElement | null) {
        if (!elem) {
            return;
        }

        if (data.length < 2) {
            return;
        }

        if (index === 0) {
            prevRef(elem);
        }

        if (index === data.length - 1) {
            nextRef(elem);
        }
    }

    return { data, infiniteScrollRef };
}
