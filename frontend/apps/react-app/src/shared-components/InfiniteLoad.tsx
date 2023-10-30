import { useInView } from 'react-intersection-observer';

export const InfiniteLoad = ({ onInView }: { onInView: () => void }) => {
  const { ref } = useInView({
    threshold: 1,
    onChange: (inView) => {
      if (inView) {
        onInView();
      }
    },
  });

  return <div ref={ref} />;
};
