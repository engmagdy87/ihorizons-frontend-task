import { useLayoutEffect, useRef, type RefObject } from "react";

export interface UseInfiniteScrollOptions extends IntersectionObserverInit {}

export interface UseInfiniteScrollResult<T extends Element> {
  targetRef: RefObject<T | null>;
}

export function useInfiniteScroll<T extends Element = HTMLDivElement>(
  onIntersect: () => void,
  options: UseInfiniteScrollOptions = { threshold: 0.1 },
  deps: ReadonlyArray<unknown> = []
): UseInfiniteScrollResult<T> {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<T | null>(null);
  const onIntersectRef = useRef<() => void>(() => {});

  onIntersectRef.current = onIntersect;

  useLayoutEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onIntersectRef.current?.();
      }
    }, options);

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { targetRef };
}
