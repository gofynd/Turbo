import * as React from "react";
import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import ArrowLeftIcon from "./slide-arrow-left.svg";
import {
  getCarouselDotWindow,
  getCarouselDotSizeTier,
} from "./carousel-dot-utils";
import styles from "./carousel.less";

/** When slide count exceeds this, dots use a sliding 5-dot viewport with tiered sizes. */
export const CAROUSEL_DOTS_COMPACT_THRESHOLD = 5;

/** Dots shown in the compact (windowed) row. */
export const CAROUSEL_DOTS_WINDOW_SIZE = 5;

/** @deprecated Use CAROUSEL_DOTS_WINDOW_SIZE */
export const CAROUSEL_DOTS_VIEWPORT_SIZE = CAROUSEL_DOTS_WINDOW_SIZE;

/**
 * Viewport info for the sliding dot window (window start aligns with previous `ws` export).
 *
 * @param {number} selectedIndex
 * @param {number} totalSlides
 * @returns {{ compact: boolean, ws: number, visibleIndices: number[], hasLeft: boolean, hasRight: boolean }}
 */
export function getCarouselDotsViewport(selectedIndex, totalSlides) {
  const { windowStart, visibleIndices } = getCarouselDotWindow(
    totalSlides,
    selectedIndex,
    {
      windowSize: CAROUSEL_DOTS_WINDOW_SIZE,
      threshold: CAROUSEL_DOTS_COMPACT_THRESHOLD,
    }
  );
  const compact = totalSlides > CAROUSEL_DOTS_COMPACT_THRESHOLD;
  const windowEnd = windowStart + visibleIndices.length - 1;
  return {
    compact,
    ws: windowStart,
    visibleIndices,
    hasLeft: compact && windowStart > 0,
    hasRight: compact && windowEnd < totalSlides - 1,
  };
}

const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        loop: true,
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    );
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState([]);
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setSelectedIndex(api.selectedScrollSnap());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const scrollTo = React.useCallback(
      (index) => {
        api?.scrollTo(index);
      },
      [api]
    );

    const handleKeyDown = React.useCallback(
      (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }

      setScrollSnaps(api.scrollSnapList());
      onSelect(api);
      const handleReInit = (emblaApi) => {
        if (!emblaApi) {
          return;
        }
        setScrollSnaps(emblaApi.scrollSnapList());
        onSelect(emblaApi);
      };

      api.on("reInit", handleReInit);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
        api?.off("reInit", handleReInit);
      };
    }, [api, onSelect]);

    const contextValue = React.useMemo(
      () => ({
        carouselRef,
        api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
      }),
      [
        carouselRef,
        api,
        opts,
        orientation,
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
      ]
    );

    return (
      <CarouselContext.Provider value={contextValue}>
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={clsx(styles.carousel, className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className={styles.carouselContent}>
      <div
        ref={ref}
        className={clsx(
          styles.carouselTrack,
          orientation === "horizontal"
            ? styles.carouselTrackHorizontal
            : styles.carouselTrackVertical,
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={clsx(
        styles.carouselItem,
        orientation === "horizontal"
          ? styles.carouselItemHorizontal
          : styles.carouselItemVertical,
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef(
  ({ className, hideOnDisable = true, ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <button
        ref={ref}
        className={clsx(
          styles.carouselBtn,
          hideOnDisable && styles.hideBtnDisabled,
          orientation === "horizontal"
            ? styles.carouselPrevBtnHorizontal
            : styles.carouselPrevBtnVertical,
          className
        )}
        disabled={!canScrollPrev}
        onClick={(e) => {
          e.stopPropagation();
          scrollPrev();
        }}
        aria-label="Previous slide"
        {...props}
      >
        <ArrowLeftIcon className={styles.carouselBtnIcon} />
      </button>
    );
  }
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef(
  ({ className, hideOnDisable = true, ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <button
        ref={ref}
        className={clsx(
          styles.carouselBtn,
          hideOnDisable && styles.hideBtnDisabled,
          orientation === "horizontal"
            ? styles.carouselNextBtnHorizontal
            : styles.carouselNextBtnVertical,
          className
        )}
        disabled={!canScrollNext}
        onClick={(e) => {
          e.stopPropagation();
          scrollNext();
        }}
        aria-label="Next slide"
        {...props}
      >
        <ArrowLeftIcon className={styles.carouselBtnIcon} />
      </button>
    );
  }
);
CarouselNext.displayName = "CarouselNext";

/** @param {import('./carousel-dot-utils').CarouselDotSizeTier | null} tier */
function carouselDotTierClass(tier) {
  if (!tier || tier === "active") {
    return null;
  }
  switch (tier) {
    case "large":
      return styles.carouselDotTierLarge;
    case "medium":
      return styles.carouselDotTierMedium;
    case "small":
      return styles.carouselDotTierSmall;
    default:
      return null;
  }
}

const CarouselDots = React.forwardRef(
  (
    {
      className,
      dotClassName,
      activeDotClassName,
      inactiveDotClassName,
      showOnSingleSlide = false,
      productsPerRow, // consumed by parent, not passed to DOM
      breakpoint, // consumed by parent, not passed to DOM
      ...props
    },
    ref
  ) => {
    const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();
    const total = scrollSnaps.length;
    const compact = total > CAROUSEL_DOTS_COMPACT_THRESHOLD;

    const { windowStart, visibleIndices } = React.useMemo(
      () =>
        getCarouselDotWindow(total, selectedIndex, {
          windowSize: CAROUSEL_DOTS_WINDOW_SIZE,
          threshold: CAROUSEL_DOTS_COMPACT_THRESHOLD,
        }),
      [total, selectedIndex]
    );

    if (!total || (total <= 1 && !showOnSingleSlide)) {
      return null;
    }

    const renderDotButton = (index, tier) => {
      const isActive = index === selectedIndex;
      const sizeClass = compact ? carouselDotTierClass(tier) : null;

      return (
        <button
          key={index}
          type="button"
          className={clsx(
            styles.carouselDot,
            sizeClass,
            isActive ? styles.carouselDotActive : styles.carouselDotInactive,
            dotClassName,
            isActive ? activeDotClassName : inactiveDotClassName
          )}
          onClick={(event) => {
            event.stopPropagation();
            scrollTo(index);
          }}
          aria-label={`Go to slide ${index + 1}`}
          aria-selected={isActive}
          role="tab"
        />
      );
    };

    return (
      <div
        ref={ref}
        className={clsx(
          styles.carouselDots,
          compact && styles.carouselDotsCompact,
          className
        )}
        role="tablist"
        aria-label="Carousel pagination"
        {...props}
      >
        {!compact &&
          scrollSnaps.map((_, index) => renderDotButton(index, null))}

        {compact &&
          visibleIndices.map((index) =>
            renderDotButton(
              index,
              getCarouselDotSizeTier(index, {
                total,
                selectedIndex,
                windowStart,
                windowSize: visibleIndices.length,
              })
            )
          )}
      </div>
    );
  }
);
CarouselDots.displayName = "CarouselDots";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
};
