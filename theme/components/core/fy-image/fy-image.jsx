import React, { useState, useEffect, useRef } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { motion, useInView } from "framer-motion";

import styles from "./fy-image.less";
import { ImageSkeleton } from "../skeletons";
import { isRunningOnClient, transformImage } from "../../../helper/utils";
import PLACEHOLDER_URL from "../../../assets/images/placeholder.png";

const FyImage = ({
  backgroundColor = "#ffffff",
  src = "",
  placeholder = "" || PLACEHOLDER_URL,
  alt = "",
  aspectRatio = 1,
  mobileAspectRatio = 1,
  showSkeleton = false,
  showOverlay = false,
  overlayColor = "#ffffff",
  sources = [
    { breakpoint: { min: 780 }, width: 1280 },
    { breakpoint: { min: 600 }, width: 1100 },
    { breakpoint: { min: 480 }, width: 1200 },
    { breakpoint: { min: 361 }, width: 900 },
    { breakpoint: { max: 360 }, width: 640 },
  ],
  isLazyLoaded = true,
  blurWidth = 50,
  customClass,
  overlayCustomClass,
  globalConfig,
  defer = true,
  isImageCover = false,
}) => {
  const { t } = useGlobalTranslation("translation");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const imgWrapperRef = useRef(null);
  // const THEME = useGlobalStore(fpi.getters.THEME);
  // const globalConfig = THEME?.config?.list[0]?.global_config?.custom?.props;
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (isRunningOnClient()) {
      setIsClient(true);
    }
    const handleIntersection = (entries) => {
      if (entries?.[0]?.isIntersecting) {
        setIsIntersecting(true);
      }
    };

    const observer = new IntersectionObserver(handleIntersection);

    if (isLazyLoaded) {
      observer.observe(imgWrapperRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isLazyLoaded]);

  const dynamicStyles = {
    "--aspect-ratio-desktop": `${aspectRatio}`,
    "--aspect-ratio-mobile": `${mobileAspectRatio}`,
    "--bg-color": `${globalConfig?.img_container_bg || backgroundColor}`,
  };

  const overlayStyles = {
    "--overlay-bgcolor": overlayColor,
  };

  const getSrc = () => {
    if (isLazyLoaded && !isIntersecting) {
      return transformImage(src, blurWidth);
    }

    if (isError) {
      return placeholder;
    } else {
      return transformImage(src);
    }
  };

  function getImageType() {
    return src.split(/[#?]/)[0].split(".").pop().trim();
  }

  function isResizable() {
    const notResizableFormat = ["gif", "svg"];
    return !notResizableFormat.includes(getImageType().toLowerCase());
  }

  const fallbackSrcset = () => {
    let url = src;

    if (!isResizable()) {
      return "";
    }

    if (isLazyLoaded && !isIntersecting) {
      return "";
    }

    if (isError) {
      url = placeholder;
    }

    return sources
      .map((s) => {
        const src = transformImage(url, s.width);
        return `${src} ${s.width}w`;
      })
      .join(", ");
  };

  const getLazyLoadSources = () =>
    sources?.map((source) => {
      source.media = getMedia(source);
      source.srcset = getUrl(source.blurWidth ?? blurWidth, source.url);
      return source;
    });

  const getSources = () => {
    // if (isLazyLoaded && !isIntersecting) {
    //   return getLazyLoadSources();
    // }

    return getLazyLoadSources().map((source) => {
      source.srcset = getUrl(source.width, source.url);
      return source;
    });
  };

  const getMedia = (source) => {
    if (source.breakpoint) {
      const min =
        (source.breakpoint.min && `(min-width: ${source.breakpoint.min}px)`) ||
        "";
      const max =
        (source.breakpoint.max && `(max-width: ${source.breakpoint.max}px)`) ||
        "";

      if (min && max) {
        return `${min} ${t("resource.common.and")} ${max}`;
      } else {
        return min || max;
      }
    } else {
      return "";
    }
  };

  const getUrl = (width, url = src) => {
    if (!isResizable()) {
      return "";
    }

    if (isError) {
      url = placeholder;
    }

    return transformImage(url, width);
  };

  const onError = () => {
    if (isLazyLoaded && !isIntersecting) {
      return;
    }
    setIsError(true);
    setIsLoading(false);
  };

  const onLoad = (e) => {
    setIsLoading(false);
    // You can emit events or perform any other actions here
  };

  return (
    <div
      className={`${styles.imageWrapper} ${
        globalConfig?.img_fill || isImageCover ? styles.fill : ""
      } ${customClass}`}
      style={dynamicStyles}
      ref={imgWrapperRef}
    >
      {showOverlay && (
        <div
          className={`${styles.overlay} ${overlayCustomClass}`}
          style={overlayStyles}
        ></div>
      )}
      <motion.div
        ref={ref}
        initial={isClient ? { opacity: 0, y: 15 } : null} // Initial state: transparent and slightly below
        animate={
          isClient ? { opacity: isInView ? 1 : 0, y: isInView ? 0 : 15 } : null
        } // Animate to visible and position in place
        transition={{ duration: 0.8 }} // Duration of the animation
      >
        <picture>
          {getSources().map((source, index) => (
            <source
              key={index}
              media={source.media}
              srcSet={source.srcset}
              type="image/webp"
            />
          ))}
          <img
            className={styles.fyImg}
            style={{
              display: !showSkeleton || !isLoading ? "block" : "none",
            }}
            srcSet={fallbackSrcset()}
            src={getSrc()}
            alt={alt}
            onError={onError}
            onLoad={onLoad}
            loading={defer ? "lazy" : "eager"}
            fetchpriority={defer ? "low" : "high"}
          />
          {showSkeleton && (
            <ImageSkeleton
              className={styles.fyImg}
              aspectRatio={aspectRatio}
              mobileAspectRatio={mobileAspectRatio}
            />
          )}
        </picture>
      </motion.div>
    </div>
  );
};

export default FyImage;
