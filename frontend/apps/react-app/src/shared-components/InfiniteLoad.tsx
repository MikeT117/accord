import { useInView } from 'react-intersection-observer';

export const InfiniteLoad = ({
    enabled,
    className,
    onInView,
}: {
    enabled: boolean;
    className?: string;
    onInView: () => void;
}) => {
    const { ref } = useInView({
        threshold: 0.01,
        onChange: (inView) => {
            if (!enabled || !inView) {
                return;
            }

            onInView();
        },
    });

    return <div className={className} ref={ref} />;
};
