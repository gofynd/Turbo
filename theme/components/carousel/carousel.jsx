import * as React from "react";
import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import ArrowLeftIcon from "./slide-arrow-left.svg";
import styles from "./carousel.less";
import { useMobile } from "../../helper/utils";

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

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
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
        }}
      >
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

const CarouselDots = React.forwardRef(
  (
    {
      className,
      dotClassName,
      activeDotClassName,
      inactiveDotClassName,
      showOnSingleSlide = false,
      ...props
    },
    ref
  ) => {
    const isMobile = useMobile(480);

    const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();

    if (
      !scrollSnaps.length ||
      (scrollSnaps.length <= 1 && !showOnSingleSlide)
    ) {
      return null;
    }

    return isMobile ? (
      <></>
    ) : (
      <div
        ref={ref}
        className={clsx(styles.carouselDots, className)}
        role="tablist"
        aria-label="Carousel pagination"
        {...props}
      >
        {scrollSnaps.map((_, index) => {
          const isActive = index === selectedIndex;

          return (
            <button
              key={index}
              type="button"
              className={clsx(
                styles.carouselDot,
                isActive
                  ? styles.carouselDotActive
                  : styles.carouselDotInactive,
                dotClassName,
                isActive ? activeDotClassName : inactiveDotClassName
              )}
              onClick={(event) => {
                event.stopPropagation();
                scrollTo(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
              aria-pressed={isActive}
              role="tab"
            />
          );
        })}
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
