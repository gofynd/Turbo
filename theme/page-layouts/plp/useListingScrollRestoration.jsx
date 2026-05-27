import { useEffect, useMemo, useRef } from "react";
import { isRunningOnClient } from "../../helper/utils";
import useScrollRestoration from "./useScrollRestoration";

const SCROLL_STATE_TTL = 30 * 60 * 1000;
const SCROLL_STATE_PREFIX = "plp_scroll_";

const saveScrollState = (key, data) => {
  if (isRunningOnClient()) {
    sessionStorage.setItem(key, JSON.stringify(data));
  }
};

const getScrollState = (key) => {
  if (isRunningOnClient()) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

const clearScrollState = (key) => {
  if (isRunningOnClient()) {
    sessionStorage.removeItem(key);
  }
};

const cleanupExpiredScrollStates = () => {
  if (!isRunningOnClient()) return;

  const keys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(SCROLL_STATE_PREFIX)) {
      keys.push(key);
    }
  }

  keys.forEach((key) => {
    const state = getScrollState(key);
    if (state && Date.now() - state.timestamp > SCROLL_STATE_TTL) {
      clearScrollState(key);
    }
  });
};

const useListingScrollRestoration = ({
  fpi,
  location,
  canRestoreScroll,
  restoreState = [],
}) => {
  const scrollStateKey = `${SCROLL_STATE_PREFIX}${location.pathname}${location.search}`;

  const scrollStateInfo = useMemo(() => {
    if (!isRunningOnClient() || !canRestoreScroll) {
      return { hasSavedState: false, savedState: null };
    }

    const state = getScrollState(scrollStateKey);
    if (state && Date.now() - state.timestamp <= SCROLL_STATE_TTL) {
      return { hasSavedState: true, savedState: state };
    } else if (state) {
      clearScrollState(scrollStateKey);
    }

    return { hasSavedState: false, savedState: null };
  }, [scrollStateKey, canRestoreScroll]);

  const { hasSavedState, savedState } = scrollStateInfo;
  const hasRestoredScroll = useRef(false);
  const isRestoringFromSavedState = useRef(hasSavedState);

  useScrollRestoration(scrollStateKey, canRestoreScroll);

  useEffect(() => {
    if (hasSavedState && savedState && !hasRestoredScroll.current) {
      restoreState.forEach(({ customKey, stateKey }) => {
        fpi.custom.setValue(customKey, savedState[stateKey]);
      });

      const restoreScroll = () => {
        window.scrollTo(0, savedState.scrollPosition);
        hasRestoredScroll.current = true;
        clearScrollState(scrollStateKey);
      };

      if (document.readyState === "complete") {
        requestAnimationFrame(restoreScroll);
      } else {
        window.addEventListener(
          "load",
          () => requestAnimationFrame(restoreScroll),
          { once: true }
        );
      }
    }
  }, [hasSavedState, savedState, scrollStateKey, fpi, restoreState]);

  useEffect(() => {
    cleanupExpiredScrollStates();
  }, []);

  const createProductNavigationHandler =
    ({ productList, items, stateToSave = {} }) =>
    () => {
      if (
        !isRunningOnClient() ||
        !canRestoreScroll ||
        !(productList?.length > 0 || items?.length > 0)
      ) {
        return;
      }

      const scrollPosition =
        window.scrollY || document.documentElement.scrollTop;

      if (scrollPosition > 100 && (productList?.length || items?.length)) {
        saveScrollState(scrollStateKey, {
          scrollPosition,
          productList: productList || items || [],
          ...stateToSave,
          timestamp: Date.now(),
          savedUrl: `${location.pathname}${location.search}`,
        });
      }
    };

  return {
    hasSavedState,
    savedState,
    isRestoringFromSavedState,
    createProductNavigationHandler,
  };
};

export default useListingScrollRestoration;
