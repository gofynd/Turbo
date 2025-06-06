import React, { useState, createRef } from "react";
import Slider from "react-slick";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import { getProductImgAspectRatio } from "../../../../helper/utils";
import Viewer3D from "../viewer-3d/viewer-3d";
import styles from "./mobile-slider.less";
import { useGlobalTranslation } from "fdk-core/utils";
import ReplayIcon from "../../../../assets/images/replay.svg";
import MuteIcon from "../../../../assets/images/mute.svg";
import UnmuteIcon from "../../../../assets/images/unmute.svg";
import AutoRotateIcon from "../../../../assets/images/auto-rotate.svg";
import WishlistIcon from "../../../../assets/images/wishlist";

function MobileSlider({
  images,
  globalConfig,
  onImageClick,
  isCustomOrder = false,
  followed,
  removeFromWishlist,
  addToWishList,
  setCurrentImageIndex,
  slideTabCentreNone = false,
  handleShare,
  showShareIcon = true,
  sources = [],
}) {
  const { t } = useGlobalTranslation("translation");
  const settings = {
    dots: true,
    infinite: images?.length > 1,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipe: true,
    swipeToSlide: false,
    touchThreshold: 90,
    draggable: false,
    touchMove: true,
    speed: 400,
    responsive: [
      {
        breakpoint: 780,
        settings: {
          centerPadding: !slideTabCentreNone && "90px",
          centerMode: images?.length > 1 && !slideTabCentreNone,
          infinite: images?.length > 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          centerMode: false,
        },
      },
    ],
  };

  const [showReplayButton, setShowReplayButton] = useState(false);
  const [isMute, setIsMute] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState([]);
  // const [currentMedia, setCurrentMedia] = useState(images[0]);
  const videoRef = createRef();

  function play() {
    videoRef?.current?.play();
  }

  function pause() {
    videoRef?.current?.pause();
  }

  function pauseVideo() {
    if (!showReplayButton) {
      if (videoRef.current?.paused) {
        play();
      } else {
        pause();
      }
    }
  }

  function onVideoEnd() {
    setShowReplayButton(true);
  }

  function toggleMute() {
    setIsMute(!isMute);
  }

  function videoLoaded(i) {
    const videoNodeList = document.querySelectorAll(
      `#mobile-video-player-${i}`
    );
    videoNodeList.forEach((video) => {
      /* eslint no-param-reassign: "error" */
      video.muted = true;
    });
    const newLoadedVideos = JSON.parse(JSON.stringify(loadedVideos));
    newLoadedVideos[i] = true;
    setLoadedVideos(newLoadedVideos);
  }

  function restartVideo(i) {
    setShowReplayButton(false);
    videoRef.current.currentTime = 0;
    videoRef.current.play();
  }

  function getImageURL(src) {
    return `http://img.youtube.com/vi/${src?.substr(
      (src?.lastIndexOf("/") ?? "") + 1
    )}/0.jpg`;
  }

  return (
    <div className={styles.mobilePdpCarouselBox} style={{ maxWidth: "100vw" }}>
      <Slider
        {...settings}
        beforeChange={(cur, next) => {
          setCurrentImageIndex(next);
          // setCurrentMedia(next);
        }}
      >
        {images?.map((media, i) => (
          <div className={styles.mediaWrapper} key={i}>
            {media.type === "image" && (
              <div onClick={() => onImageClick()}>
                <FyImage
                  src={media?.url}
                  alt={media?.alt}
                  isImageFill={globalConfig?.img_fill}
                  aspectRatio={getProductImgAspectRatio(globalConfig)}
                  sources={sources}
                  defer={i > 1}
                  globalConfig={globalConfig}
                />
              </div>
            )}
            {media.type === "video" && (
              <div className={styles.videoContainer}>
                {media?.url.includes("youtube") && (
                  <img
                    src={getImageURL(media.url)}
                    alt={media.alt}
                    onClick={() => onImageClick()}
                  />
                )}
                <div className={styles.videoPlayerWrapper}>
                  {!media?.url.includes("youtube") && (
                    <div>
                      <video
                        ref={videoRef}
                        id={`mobile-video-player-${i}`}
                        className={styles.originalVideo}
                        controls={false}
                        autoPlay
                        muted={isMute}
                        onClick={pauseVideo}
                        onEnded={onVideoEnd}
                      // onLoadedData={videoLoaded(i)}
                      >
                        <source src={media?.url} type="video/mp4" />
                      </video>
                      <div>
                        {showReplayButton && (
                          <ReplayIcon
                            className={`${styles.playerIcon} ${styles.playerReplay}`}
                            onClick={() => restartVideo(i)}
                          />
                        )}
                        <span
                          onClick={() => {
                            toggleMute();
                          }}
                        >
                          {isMute ? (
                            <MuteIcon
                              className={`${styles.playerIcon} ${styles.playerMute}`}
                            />
                          ) : (
                            <UnmuteIcon
                              className={`${styles.playerIcon} ${styles.playerMute}`}
                            />
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {media.type === "3d_model" && (
              <div className={styles.type3dModel}>
                <Viewer3D src={media.url} />
                <AutoRotateIcon
                  className={styles.autoRotateIcon}
                  onClick={() => onImageClick()}
                />
              </div>
            )}
            {isCustomOrder && (
              <div className={`${styles.badge} ${styles.b4}`}>
                {t("resource.product.made_to_order")}
              </div>
            )}
            <button
              type="button"
              aria-label="Wishlist"
              className={`${followed ? styles.activeWishlist : ""} ${styles.wishlistIcon}`}
              onClick={(e) =>
                followed ? removeFromWishlist(e) : addToWishList(e)
              }
            >
              <WishlistIcon isActive={followed} />
            </button>
          </div>
        ))}
      </Slider>
      {/* Removed share icon from slider */}
      {/* {showShareIcon && (
        <ShareIcon
          className={
            currentMedia?.type === "video"
              ? styles.VideoShareIcon
              : styles.shareIcon
          }
          onClick={() => handleShare()}
        />
      )} */}
    </div>
  );
}

export default MobileSlider;
