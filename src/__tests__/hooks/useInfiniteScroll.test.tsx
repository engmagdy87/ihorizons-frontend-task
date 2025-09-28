import { renderHook, act } from "@testing-library/react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

describe("useInfiniteScroll", () => {
  let observeMock: jest.Mock;
  let disconnectMock: jest.Mock;

  beforeEach(() => {
    observeMock = jest.fn();
    disconnectMock = jest.fn();

    // Mock global IntersectionObserver
    // Aligns with existing pattern used in Home tests
    let lastInstance: any = null;
    (global as any).IntersectionObserver = class IntersectionObserver {
      callback: (entries: Array<{ isIntersecting: boolean }>) => void;
      options: IntersectionObserverInit;
      constructor(
        callback: (entries: Array<{ isIntersecting: boolean }>) => void,
        options: IntersectionObserverInit
      ) {
        this.callback = callback;
        this.options = options;
        lastInstance = this;
        (global as any).__lastObserver = lastInstance;
      }
      observe = observeMock;
      disconnect = disconnectMock;
      // Helper to simulate intersection
      __trigger(entries: Array<{ isIntersecting: boolean }>) {
        this.callback(entries as any);
      }
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("observes the target and calls onIntersect when intersecting", () => {
    const onIntersect = jest.fn();
    const { result, rerender } = renderHook(
      ({ deps }) => useInfiniteScroll(onIntersect, { threshold: 0.1 }, deps),
      {
        initialProps: { deps: [0] },
      }
    );

    // Provide a DOM node to the ref
    const div = document.createElement("div");
    act(() => {
      (result.current.targetRef as any).current = div;
    });

    // Trigger effect by changing deps (ref changes don't trigger effects)
    rerender({ deps: [1] });

    expect(observeMock).toHaveBeenCalledWith(div);

    // Simulate an intersection event on the last created observer
    const last = (global as any).__lastObserver;
    last.__trigger([{ isIntersecting: true }]);
    expect(onIntersect).toHaveBeenCalledTimes(1);
  });

  it("disconnects observer on unmount", () => {
    const onIntersect = jest.fn();
    const { result, unmount, rerender } = renderHook(
      ({ deps }) => useInfiniteScroll(onIntersect, {}, deps),
      {
        initialProps: { deps: [0] },
      }
    );
    const div = document.createElement("div");
    act(() => {
      (result.current.targetRef as any).current = div;
    });
    rerender({ deps: [1] });
    expect(observeMock).toHaveBeenCalled();

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it("re-initializes observer when deps change", () => {
    const onIntersect = jest.fn();
    const { result, rerender } = renderHook(
      ({ deps }) => useInfiniteScroll(onIntersect, { threshold: 0.1 }, deps),
      {
        initialProps: { deps: [0] },
      }
    );

    // Attach a node and trigger setup
    const div = document.createElement("div");
    act(() => {
      (result.current.targetRef as any).current = div;
    });
    rerender({ deps: [1] });
    expect(observeMock).toHaveBeenCalledTimes(1);

    rerender({ deps: [2] });
    expect(disconnectMock.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(observeMock).toHaveBeenCalledTimes(2);
  });
});
