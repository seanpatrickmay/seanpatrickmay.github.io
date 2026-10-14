import { useEffect, useRef, useState } from 'react';

export function useNearViewport(rootMargin = '600px') {
  const ref = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || near) return;
    if (typeof IntersectionObserver !== 'function') {
      setNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [near, rootMargin]);

  return [ref, near];
}
