import { useEffect, useRef } from "react";
import { isRunningOnClient } from "../../helper/utils";

/**
 * Custom hook to handle scroll restoration for PLP infinite scroll
 * Prevents auto-scroll to top when returning from PDP
 */
const useScrollRestoration = (scrollStateKey, isInfiniteScroll = false) => {
  const hasNavigationState = useRef(false);

  useEffect(() => {
    if (!isRunningOnClient() || !isInfiniteScroll) return;

    // Check if we have saved scroll state
    const checkForSavedState = () => {
      const savedState = sessionStorage.getItem(scrollStateKey);
      hasNavigationState.current = !!savedState;

      // Temporarily disable automatic scroll to top if we have saved state
      if (hasNavigationState.current) {
        const originalScrollTo = window.scrollTo;
        let scrollCallCount = 0;

        // Override scrollTo temporarily to prevent auto-scroll to top
        window.scrollTo = function (x, y) {
          scrollCallCount++;
          // Allow the first few scroll calls (usually from our restoration)
          // but block the automatic scroll to top that happens on route change
          if (scrollCallCount <= 2 || y !== 0) {
            originalScrollTo.call(window, x, y);
          }
        };

        // Restore original scrollTo after a delay
        setTimeout(() => {
          window.scrollTo = originalScrollTo;
          hasNavigationState.current = false;
        }, 500);
      }
    };

    checkForSavedState();
  }, [scrollStateKey, isInfiniteScroll]);

  return { hasNavigationState: hasNavigationState.current };
};

export default useScrollRestoration;
