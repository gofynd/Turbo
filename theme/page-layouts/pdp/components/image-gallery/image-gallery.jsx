import React, { useState, useEffect, useRef, Suspense } from "react";
import PicZoom from "../pic-zoom/pic-zoom";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import {
  getProductImgAspectRatio,
  isRunningOnClient,
} from "../../../../helper/utils";
import styles from "./image-gallery.less";
import MobileSlider from "../mobile-slider/mobile-slider";
import VideoPlayIcon from "../../../../assets/images/video-play.svg";
import ThreeDIcon from "../../../../assets/images/3D.svg";
import CarouselNavArrowIcon from "../../../../assets/images/carousel-nav-arrow.svg";
import ArrowLeftIcon from "../../../../assets/images/arrow-left.svg";
import ArrowRightIcon from "../../../../assets/images/arrow-right.svg";
import { useGlobalTranslation } from "fdk-core/utils";
import { Skeleton } from "../../../../components/core/skeletons";

const LightboxImage = React.lazy(
  () => import("../lightbox-image/lightbox-image")
);

function PdpImageGallery({
  isLoading,
  images = [],
  displayThumbnail = true,
  isCustomOrder = false,
  iconColor = "",
  globalConfig = {},
  followed,
  removeFromWishlist,
  addToWishList,
  hiddenDots = false,
  slideTabCentreNone = true,
  hideImagePreview = false,
  handleShare,
  showShareIcon = true,
  imgSources = [],
  // Sale tag props (configuration-based)
  showSaleTag = false,
  displayMode = "carousel", // "carousel", "vertical", or "vertical-with-thumbnail"
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [enableLightBox, setEnableLightBox] = useState(false);
  const [resumeVideo, setResumeVideo] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { t } = useGlobalTranslation("translation");
  const itemWrapperRef = useRef(null);
  const thumbnailSidebarRef = useRef(null);
  const mainImagesRefs = useRef([]);
  const verticalContainerRef = useRef(null);

  const handleVerticalContainerWheel = (event) => {
    const container = verticalContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const { deltaY } = event;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
    const pageAtTop = window.scrollY <= 0;

    // Prefer scrolling the page first when scrolling up
    if (deltaY < 0) {
      if (!pageAtTop) {
        event.preventDefault();
        window.scrollBy({ top: deltaY, left: 0 });
        return;
      }
      // Page is already at top; allow container to process upward scroll
      return;
    }

    // When scrolling down and container reached bottom, pass scroll to page
    if (deltaY > 0 && atBottom) {
      event.preventDefault();
      window.scrollBy({ top: deltaY, left: 0 });
    }
  };

  const currentMedia = {
    src: images?.[currentImageIndex]?.url || "",
    type: images?.[currentImageIndex]?.type || "",
    alt: images?.[currentImageIndex]?.alt || "",
  };

  useEffect(() => {
    if (isRunningOnClient()) {
      const classList = document.body?.classList;

      if (enableLightBox && classList) {
        classList.add("remove-scroll");
      } else {
        classList.remove("remove-scroll");
      }
    }
  }, [enableLightBox]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [images]);

  // Auto-scroll active thumbnail into view for vertical-with-thumbnail mode
  useEffect(() => {
    if (
      displayMode === "vertical-with-thumbnail" &&
      thumbnailSidebarRef.current
    ) {
      const activeThumbnail =
        thumbnailSidebarRef.current.querySelector(".activeThumbnail");
      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [currentImageIndex, displayMode]);

  // Intersection observer to auto-update currentImageIndex based on container scroll
  useEffect(() => {
    if (displayMode !== "vertical-with-thumbnail" || !isRunningOnClient()) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.imageIndex, 10);
            if (!Number.isNaN(index)) {
              setCurrentImageIndex(index);
            }
          }
        });
      },
      {
        root: verticalContainerRef.current,
        rootMargin: "-50% 0px -50% 0px", // Trigger when image is in center of container viewport
        threshold: 0,
      }
    );

    const currentRefs = mainImagesRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [displayMode, images]);

  // Rely on CSS overscroll-behavior to prevent page scroll chaining

  const setMainImage = (e, index) => {
    e.preventDefault();
    if (index >= 0) {
      setCurrentImageIndex(index);
    }
  };

  const getImageURL = (srcUrl) =>
    /* eslint-disable no-unsafe-optional-chaining */
    `http://img.youtube.com/vi/${srcUrl?.substr(srcUrl?.lastIndexOf("/") + 1)}/0.jpg`;

  const prevSlide = () => {
    if (currentImageIndex === 0) {
      return;
    } // cannot move backward
    if (!hiddenDots) {
      itemWrapperRef.current.scrollLeft -= 75;
    }
    setCurrentImageIndex((prevIndex) => prevIndex - 1);
  };

  const nextSlide = () => {
    if (currentImageIndex === images.length - 1) {
      return;
    } // cannot move forward
    if (!hiddenDots) {
      itemWrapperRef.current.scrollLeft += 75;
    }
    setCurrentImageIndex((prevIndex) => prevIndex + 1);
  };

  const openGallery = (index = 0) => {
    setSelectedImageIndex(index);
    setEnableLightBox(true);
  };

  const openGalleryFromCarousel = () => {
    setSelectedImageIndex(currentImageIndex);
    setEnableLightBox(true);
  };

  // Render Carousel Mode
  const renderCarouselMode = () => (
    <div className={`${styles.imageGallery} ${styles.desktop}`}>
      <div className={styles.flexAlignCenter}>
        <div
          className={`${styles.carouselArrow} ${
            styles["carouselArrow--left"]
          } ${currentImageIndex <= 0 ? styles.disableArrow : ""}`}
          onClick={prevSlide}
        >
          <CarouselNavArrowIcon />
        </div>
        <div className={styles.imageBox}>
          {isLoading ? (
            <Skeleton width={"100%"} aspectRatio={getProductImgAspectRatio(globalConfig)}  />
          ) : (
          <PicZoom
            customClass={styles.imageItem}
            source={currentMedia.src}
            type={currentMedia.type}
            alt={currentMedia.alt}
            currentIndex={currentImageIndex}
            sources={imgSources}
            onClickImage={() => openGalleryFromCarousel()}
            resumeVideo={resumeVideo}
            globalConfig={globalConfig}
            followed={followed}
            removeFromWishlist={removeFromWishlist}
            addToWishList={addToWishList}
            hideImagePreview={hideImagePreview}
          />
          )}
          {isCustomOrder && (
            <div className={`${styles.badge} ${styles.b4}`}>
              {t("resource.product.made_to_order")}
            </div>
          )}
        </div>
        <div
          className={`${styles.carouselArrow} ${
            currentImageIndex >= images.length - 1 ? styles.disableArrow : ""
          }`}
          onClick={nextSlide}
        >
          <CarouselNavArrowIcon />
        </div>
      </div>

      {!hiddenDots && (
        <div
          className={`${styles.thumbSlider} ${
            displayThumbnail ? "" : styles.hidden
          }}`}
        >
          <div
            className={`${styles.thumbWrapper} ${
              images && images.length < 5 ? styles.removeWidth : ""
            }`}
          >
            <button
              type="button"
              className={`${styles.prevBtn} ${styles.btnNavGallery}`}
              onClick={prevSlide}
              aria-label={t("resource.facets.prev")}
            >
              <ArrowLeftIcon
                className={`${
                  currentImageIndex <= 0 ? styles.disableArrow : ""
                } ${styles.navArrowIcon}`}
              />
            </button>
            <ul
              ref={itemWrapperRef}
              className={`${styles.thumbnailList} ${
                styles.scrollbarHidden
              } ${images && images?.length < 5 ? styles.fitContent : ""}`}
            >
              {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */}
              {images.map((item, index) => 
               isLoading ? (
                  <Skeleton  width={"100%"} aspectRatio={getProductImgAspectRatio(globalConfig)} />
                ) : (
                <li
                  key={index}
                  onClick={(e) => setMainImage(e, index)}
                  className={`${styles.thumbnail} ${
                    item.type === "video" ? styles.flexAlign : ""
                  } ${currentImageIndex === index ? styles.active : ""}`}
                  style={{ "--icon-color": iconColor }}
                >
                  {item.type === "image" && (
                    <FyImage
                      customClass={`${styles["thumbnailList--item"]}`}
                      src={item?.url}
                      alt={item?.alt}
                      aspectRatio={getProductImgAspectRatio(globalConfig)}
                      sources={[{ width: 100 }]}
                      globalConfig={globalConfig}
                      isImageFill={globalConfig?.img_fill}
                    />
                  )}
                  {item.type === "video" && (
                    <>
                      {item.url.includes("youtube") ? (
                        <img
                          className={`${styles["thumbnailList--item"]} ${styles.videoThumbnail}`}
                          src={getImageURL(item.url)}
                          alt={item.alt}
                        />
                      ) : (
                        <video
                          className={`${styles["thumbnailList--item"]} ${styles.videoThumbnail}`}
                          src={item?.url}
                        />
                      )}
                      <VideoPlayIcon className={styles.videoPlayIcon} />
                    </>
                  )}
                  {item.type === "3d_model" && (
                    <ThreeDIcon className={styles.modelIcon} />
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`${styles.nextBtn} ${styles.btnNavGallery}`}
              onClick={nextSlide}
              aria-label={t("resource.facets.next")}
            >
              <ArrowRightIcon
                className={`${
                  currentImageIndex >= images.length - 1
                    ? styles.disableArrow
                    : ""
                } ${styles.navArrowIcon}`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Render Vertical Mode
  const renderVerticalMode = () => (
    <div className={`${styles.imageGallery} ${styles.desktop}`}>
      <div className={styles.verticalImageContainer}>
        {images.map((item, index) => (
          <div key={index} className={styles.verticalImageItem}>
            <PicZoom
              customClass={styles.imageItem}
              source={item.url}
              type={item.type}
              alt={item.alt}
              currentIndex={index}
              sources={imgSources}
              onClickImage={() => openGallery(index)}
              resumeVideo={resumeVideo}
              globalConfig={globalConfig}
              followed={followed}
              removeFromWishlist={removeFromWishlist}
              addToWishList={addToWishList}
              hideImagePreview={hideImagePreview}
              showWishlist={images.length === 1 ? index === 0 : index === 1}
            />
            {/* Sale Tag - Configuration-based */}
            {showSaleTag && (
              <div>
                <span className={styles.saleTag}>
                  {t("resource.common.sale")}
                </span>
              </div>
            )}
            {isCustomOrder && index === 0 && (
              <div className={`${styles.badge} ${styles.b4}`}>
                {t("resource.product.made_to_order")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render Vertical with Thumbnail Mode
  const renderVerticalWithThumbnailMode = () => (
    <div
      className={`${styles.imageGallery} ${styles.desktop} ${styles.verticalWithThumbnailLayout}`}
    >
      <div
        className={styles.verticalWithThumbnailContainer}
        ref={verticalContainerRef}
        onWheel={handleVerticalContainerWheel}
      >
        {/* Thumbnail Sidebar */}
        <div className={styles.thumbnailSidebar} ref={thumbnailSidebarRef}>
          <div className={styles.thumbnailListVertical}>
            {images.map((item, index) => (
              <div
                key={index}
                className={`${styles.thumbnailItem} ${
                  currentImageIndex === index ? styles.activeThumbnail : ""
                }`}
                onClick={() => {
                  setCurrentImageIndex(index);
                  // Smooth scroll to corresponding main image
                  if (
                    displayMode === "vertical-with-thumbnail" &&
                    mainImagesRefs.current[index]
                  ) {
                    mainImagesRefs.current[index].scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                }}
                style={{ "--icon-color": iconColor }}
              >
                {item.type === "image" && (
                  <FyImage
                    customClass={styles.thumbnailImage}
                    src={item?.url}
                    alt={item?.alt}
                    aspectRatio={getProductImgAspectRatio(globalConfig)}
                    sources={[{ width: 80 }]}
                    globalConfig={globalConfig}
                    isImageFill={globalConfig?.img_fill}
                  />
                )}
                {item.type === "video" && (
                  <div className={styles.thumbnailVideoContainer}>
                    {item.url.includes("youtube") ? (
                      <img
                        className={styles.thumbnailImage}
                        src={getImageURL(item.url)}
                        alt={item.alt}
                      />
                    ) : (
                      <video
                        className={styles.thumbnailImage}
                        src={item?.url}
                      />
                    )}
                    <VideoPlayIcon className={styles.videoPlayIcon} />
                  </div>
                )}
                {item.type === "3d_model" && (
                  <div className={styles.thumbnail3DContainer}>
                    <ThreeDIcon className={styles.modelIcon} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Images Vertical Line */}
        <div className={styles.mainImagesArea}>
          <div className={styles.mainImagesVertical}>
            {images.map((item, index) => (
              <div
                key={index}
                className={styles.mainImageItem}
                ref={(el) => {
                  mainImagesRefs.current[index] = el;
                }}
                data-image-index={index}
              >
                <PicZoom
                  customClass={styles.imageItem}
                  source={item.url}
                  type={item.type}
                  alt={item.alt}
                  currentIndex={index}
                  sources={imgSources}
                  onClickImage={() => openGallery(index)}
                  resumeVideo={resumeVideo}
                  globalConfig={globalConfig}
                  followed={followed}
                  removeFromWishlist={removeFromWishlist}
                  addToWishList={addToWishList}
                  hideImagePreview={hideImagePreview}
                />
                {isCustomOrder && index === 0 && (
                  <div className={`${styles.badge} ${styles.b4}`}>
                    {t("resource.product.made_to_order")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderByMode = () => {
    if (displayMode === "carousel") {
      return renderCarouselMode();
    }
    if (displayMode === "vertical-with-thumbnail") {
      return renderVerticalWithThumbnailMode();
    }
    return renderVerticalMode();
  };

  return (
    <div className={styles.galleryBox}>
      {renderByMode()}

      <div className={styles.mobile}>
        <MobileSlider
          images={images}
          onImageClick={() => openGallery()}
          isCustomOrder={isCustomOrder}
          resumeVideo={resumeVideo}
          globalConfig={globalConfig}
          followed={followed}
          sources={imgSources}
          removeFromWishlist={removeFromWishlist}
          addToWishList={addToWishList}
          setCurrentImageIndex={setCurrentImageIndex}
          slideTabCentreNone={slideTabCentreNone}
          handleShare={handleShare}
          showShareIcon={showShareIcon}
          showSaleTag={showSaleTag}
        />
      </div>

      {enableLightBox && (
        <Suspense fallback={<div />}>
          <LightboxImage
            images={images}
            showCaption={false}
            showLightBox={enableLightBox}
            iconColor={iconColor}
            toggleResumeVideo={() => setResumeVideo((prev) => !prev)}
            globalConfig={globalConfig}
            closeGallery={() => setEnableLightBox(false)}
            currentIndex={selectedImageIndex}
            imgSources={imgSources}
          />
        </Suspense>
      )}
    </div>
  );
}

export default PdpImageGallery;
