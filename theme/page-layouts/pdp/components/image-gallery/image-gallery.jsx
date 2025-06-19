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

const LightboxImage = React.lazy(
  () => import("../lightbox-image/lightbox-image")
);

function PdpImageGallery({
  images,
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
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [enableLightBox, setEnableLightBox] = useState(false);
  const [resumeVideo, setResumeVideo] = useState(false);
  const { t } = useGlobalTranslation("translation");
  const itemWrapperRef = useRef(null);

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

  const openGallery = () => {
    setEnableLightBox(true);
  };

  return (
    <div className={styles.galleryBox}>
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
            <PicZoom
              customClass={styles.imageItem}
              source={currentMedia.src}
              type={currentMedia.type}
              alt={currentMedia.alt}
              currentIndex={currentImageIndex}
              sources={imgSources}
              onClickImage={() => openGallery()}
              resumeVideo={resumeVideo}
              globalConfig={globalConfig}
              followed={followed}
              removeFromWishlist={removeFromWishlist}
              addToWishList={addToWishList}
              hideImagePreview={hideImagePreview}
            />
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
                {images.map((item, index) => (
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
            currentIndex={currentImageIndex}
            imgSources={imgSources}
          />
        </Suspense>
      )}
    </div>
  );
}

export default PdpImageGallery;
