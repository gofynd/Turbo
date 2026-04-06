import React, { useState, useEffect, useRef } from "react";
import { useGlobalTranslation } from "fdk-core/utils";
import { motion } from "framer-motion";

import styles from "./fy-image.less";
import { ImageSkeleton } from "../skeletons";
import { transformImage } from "../../../helper/utils";
import { RESPONSIVE_IMAGE_BREAKPOINTS } from "../../../helper/constant";
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
  // Use optimized breakpoints from config by default
  sources = RESPONSIVE_IMAGE_BREAKPOINTS,
  isLazyLoaded = true,
  blurWidth = 50,
  customClass,
  overlayCustomClass,
  globalConfig,
  defer = true,
  // Legacy prop name in this file
  isImageCover = false,
  // New prop name to match Firestone FyImage and callers
  isImageFill = false,
}) => {
  const { t } = useGlobalTranslation("translation");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgWrapperRef = useRef(null);
  // const THEME = useGlobalStore(fpi.getters.THEME);
  // const globalConfig = THEME?.config?.list[0]?.global_config?.custom?.props;
  useEffect(() => {
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

  const bgColor = globalConfig?.img_container_bg || backgroundColor;
  const dynamicStyles = {
    "--aspect-ratio-desktop": `${aspectRatio}`,
    "--aspect-ratio-mobile": `${mobileAspectRatio}`,
    ...(bgColor && typeof bgColor === "string" && bgColor.trim() ? { "--bg-color": `${bgColor}` } : {}),
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

  const shouldFillImage =
    !!(globalConfig?.img_fill || isImageCover || isImageFill);

  return (
    <div
      className={`${styles.imageWrapper} ${
        shouldFillImage ? styles.fill : ""
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
        initial={defer ? { opacity: 0, y: 15 } : false}
        whileInView={defer ? { opacity: 1, y: 0 } : undefined}
        viewport={defer ? { once: true } : undefined}
        transition={{ duration: 0.8 }}
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
