import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Viewer3D from "../viewer-3d/viewer-3d";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import styles from "./pic-zoom.less";
import { getProductImgAspectRatio } from "../../../../helper/utils";
import ReplayIcon from "../../../../assets/images/replay.svg";
import MuteIcon from "../../../../assets/images/mute.svg";
import UnmuteIcon from "../../../../assets/images/unmute.svg";
import AutoRotateIcon from "../../../../assets/images/auto-rotate.svg";
import WishlistIcon from "../../../../assets/images/wishlist";

function PicZoom({
  source,
  type,
  alt,
  currentIndex,
  resumeVideo,
  globalConfig,
  customClass,
  onClickImage,
  followed,
  removeFromWishlist,
  addToWishList,
  isLoading,
  hideImagePreview = false,
  sources = [],
}) {
  const [imageFullyLoaded, setImageFullyLoaded] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [isMute, setIsMute] = useState(true);
  const [showReplayButton, setShowReplayButton] = useState(false);

  useEffect(() => {
    setImageFullyLoaded(true);
    setImageLoading(false);
  }, [source]);

  useEffect(() => {
    if (resumeVideo && !showReplayButton) {
      const videoPlayer = document.getElementById("html-video-player");
      if (videoPlayer) {
        videoPlayer.play();
      }
    }
  }, [resumeVideo, showReplayButton]);

  const onPlayerExpand = () => {
    if (!showReplayButton) {
      const videoPlayer = document.getElementById("html-video-player");
      if (videoPlayer) videoPlayer.pause();
    }
    onClickImage(currentIndex);
  };

  const toggleMute = () => {
    setIsMute(!isMute);
  };

  const restartVideo = () => {
    setShowReplayButton(false);
    const videoPlayer = document.getElementById("html-video-player");
    if (videoPlayer) {
      videoPlayer.currentTime = 0;
      videoPlayer.play();
    }
  };

  const pauseVideo = () => {
    if (!showReplayButton) {
      const videoPlayer = document.getElementById("html-video-player");
      if (videoPlayer) {
        if (videoPlayer.paused) {
          videoPlayer.play();
        } else {
          videoPlayer.pause();
        }
      }
    }
  };

  const onVideoEnd = () => {
    setShowReplayButton(true);
  };

  const iframeload = () => {
    setIsFrameLoading(false);
  };

  const imageLoaded = () => {
    setImageFullyLoaded(true);
  };

  const getOriginalImage = () => source || "";

  useEffect(() => {
    setIsMounted(true);
    setIsFrameLoading(true);
  }, []);

  return (
    <div className={customClass}>
      {type === "image" && (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          className={!hideImagePreview ? styles.loadImage : ""}
          onClick={() => {
            if (!hideImagePreview) {
              onClickImage(currentIndex);
            }
          }}
        >
          {!isLoading && (
            <FyImage
              customClass={styles.pdpImage}
              src={source}
              alt={alt}
              aspectRatio={getProductImgAspectRatio(globalConfig)}
              globalConfig={globalConfig}
              onLoad={imageLoaded}
              sources={sources}
              defer={false}
            />
          )}
        </div>
      )}
      {type === "video" && (
        <div className={styles.videoContainer}>
          {!getOriginalImage().includes("youtube") ? (
            <div className={styles.videoPlayerWrapper}>
              <video
                id="html-video-player"
                className={`${styles.originalVideo} ${styles.videoPlayer}`}
                src={getOriginalImage()}
                data-loaded="false"
                controls={false}
                autoPlay
                muted={isMute}
                onLoadedData={iframeload}
                onClick={pauseVideo}
                onEnded={onVideoEnd}
              />

              <ReplayIcon
                className={`${styles.playerIcon} ${styles.playerReplay}`}
                style={{ display: showReplayButton ? "block" : "none" }}
                onClick={restartVideo}
              />
              <span onClick={toggleMute}>
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

              {/* <SvgWrapper
                svgSrc="expand-media"
                className={`${styles.playerIcon} ${styles.playerExpand}`}
                onClick={onPlayerExpand}
              /> */}
            </div>
          ) : (
            <iframe
              className={styles.originalVideo}
              src={getOriginalImage()}
              allowFullScreen
              onLoad={iframeload}
              title="Youtube"
            />
          )}
          {isFrameLoading && <div id="loader" />}
        </div>
      )}
      {type === "3d_model" && isMounted && (
        <div className={styles.type3dModel}>
          <Viewer3D src={getOriginalImage()} />
          <button
            type="button"
            className={styles.expandBtn}
            onClick={() => onClickImage(currentIndex)}
            aria-label="Open"
          >
            <AutoRotateIcon />
          </button>
        </div>
      )}
      <button
        type="button"
        aria-label="Wishlist"
        className={`${styles.wishlistIcon} ${followed ? styles.activeWishlist : ""}`}
        onClick={(e) => (followed ? removeFromWishlist(e) : addToWishList(e))}
      >
        <WishlistIcon isActive={followed} />
      </button>
    </div>
  );
}

PicZoom.propTypes = {
  source: PropTypes.string.isRequired,
  type: PropTypes.string,
  alt: PropTypes.string,
  currentIndex: PropTypes.number.isRequired,
  resumeVideo: PropTypes.bool,
  onClickImage: PropTypes.func.isRequired,
};

export default PicZoom;
