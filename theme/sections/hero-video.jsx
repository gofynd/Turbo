import React from "react";
import styles from "../styles/sections/hero-video.less";
import placeholderImage from "../assets/images/placeholder/hero-video.png";
import { useGlobalTranslation } from "fdk-core/utils";
import PlayIcon from "../assets/images/play.svg";
import PauseIcon from "../assets/images/pause.svg";
import { useVideoPlayer } from "../page-layouts/hero-video/useVideoPlayer";
import { useViewport } from "../helper/hooks";
import { useWindowWidth } from "../helper/hooks";
import { getMediaLayout } from "../helper/media-layout";

export function Component({ props, globalConfig }) {
  const isMobileView = useViewport(0, 500);
  const {
    videoFile,
    mobileVideoFile,
    mobileVideoUrl,
    videoUrl,
    autoplay,
    hidecontrols,
    showloop,
    is_pause_button,
    title,
    coverUrl,
    padding_top,
    padding_bottom,
    height_mode,
    desktop_height,
    mobile_height,
    desktop_aspect_ratio,
    mobile_aspect_ratio,
  } = props;
  const { t } = useGlobalTranslation("translation");
  const windowWidth = useWindowWidth();
  const isMobileViewport = windowWidth <= 768;

  const VideoUrlValue =
    typeof window !== "undefined" && isMobileView && mobileVideoUrl?.value
      ? mobileVideoUrl
      : videoUrl;

  const {
    videoRef,
    mobileVideoRef,
    ytVideoRef,
    showOverlay,
    ytOverlay,
    getVideoSource,
    getYTVideoID,
    playVideo,
    closeVideo,
    handleVideoClick,
    setShowOverlay,
    setIsLoading,
    isYoutube,
    isValidUrl,
    isMobile,
    isIOS,
    getImgSrcSet,
    getMobileVideoSource,
  } = useVideoPlayer({
    videoUrl: VideoUrlValue,
    mobileVideoUrl: mobileVideoUrl,
    videoFile: videoFile,
    mobileVideoFile: mobileVideoFile,
    autoplay: autoplay,
    hidecontrols: hidecontrols,
    showloop: showloop,
    globalConfig: globalConfig,
  });

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 0}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  // Only use mediaLayout when height_mode is explicitly configured
  const hasHeightConfig =
    height_mode?.value &&
    height_mode.value !== "auto" &&
    (height_mode.value === "aspect_ratio" ||
      height_mode.value === "fixed_height");

  const mediaLayout = hasHeightConfig
    ? getMediaLayout(
        {
          height_mode,
          desktop_height,
          mobile_height,
          desktop_aspect_ratio,
          mobile_aspect_ratio,
        },
        isMobileViewport,
        16 / 9
      )
    : null;

  const videoWrapperClass = [
    styles.video_container,
    mediaLayout
      ? [
          styles.mediaShell,
          mediaLayout.isAspectRatio ? styles.mediaShellAspect : "",
          mediaLayout.isFixedHeight ? styles.mediaShellFixedHeight : "",
        ]
      : [],
  ]
    .flat()
    .filter(Boolean)
    .join(" ");

  const mobilePlaceHolder = Boolean(
    mobileVideoFile?.value ||
      mobileVideoUrl?.value ||
      videoFile?.value ||
      videoUrl?.value
  );

  const desktopPlaceHolder = Boolean(videoFile?.value || videoUrl?.value);

  // Only show image when there's no video (cover image or placeholder as fallback)
  const shouldShowImage = !mobilePlaceHolder;

  const VideoControls = () => {
    return (
      <>
        {showOverlay && (
          <div
            onClick={playVideo}
            className={`overlay-noimage:${coverUrl?.value} youtube-noimage: ${isYoutube()}`}
          >
            {coverUrl.value && (
              <div
                className={styles.overlay__image}
                style={{
                  background: `#ccc url(${coverUrl?.value}) center/cover no-repeat `,
                }}
              ></div>
            )}
            {isMobile && !hidecontrols?.value ? (
              <></>
            ) : (
              <div className={styles.overlay__content}>
                <div
                  id="play"
                  // onClick={playVideo}
                  className={styles.overlay__playButton}
                >
                  <PlayIcon />
                </div>
              </div>
            )}
          </div>
        )}
        {is_pause_button?.value && !showOverlay && ytOverlay && (
          <div className={styles.pauseButton} onClick={closeVideo}>
            <PauseIcon />
          </div>
        )}
        {shouldShowImage && (
          <img
            className={`${styles.imagePlaceholder} ${styles.mediaFill} ${!desktopPlaceHolder ? styles.showDesktopPlaceholder : ""} ${!mobilePlaceHolder ? styles.showImagePlaceholder : ""} `}
            src={coverUrl?.value || placeholderImage}
            alt={t("resource.common.placeholder")}
            srcSet={getImgSrcSet()}
          />
        )}
      </>
    );
  };
  return (
    <section style={dynamicStyles}>
      {title?.value && (
      <h2 className={`fx-title ${styles.video_heading} fontHeader`}>
        {title?.value}
      </h2>
    )}

      <div
        className={`${videoWrapperClass} ${styles.show_on_desktop}`}
        style={mediaLayout?.style}
      >
        {videoFile?.value ? (
          <video
            ref={videoRef}
            onClick={
              isIOS() && !hidecontrols?.value ? undefined : handleVideoClick
            }
            width="100%"
            poster={coverUrl?.value}
            autoPlay={autoplay?.value}
            muted={autoplay?.value}
            loop={showloop?.value}
            controls={!hidecontrols?.value}
            webkit-playsinline="true"
            playsInline
            onPause={() => setShowOverlay(true)}
            onEnded={() => setShowOverlay(true)}
            onPlay={() => setShowOverlay(false)}
            onLoadedData={() => setIsLoading(false)}
            onProgress={() => setIsLoading(false)}
            preload="auto"
            src={getVideoSource}
            allowFullScreen
            className={`${styles.mediaFill} ${styles.videoElement}`}
          ></video>
        ) : (
          isYoutube() &&
          isValidUrl &&
          !isMobile && (
            <div className={`${styles.youtube_wrapper} ${styles.mediaFill}`}>
              <div
                className={styles.yt_video}
                ref={ytVideoRef}
                id={`yt-video-${getYTVideoID(videoUrl?.value)}`}
                data-videoid={getYTVideoID(videoUrl?.value)}
                data-videometa={JSON.stringify(props)}
                allowFullScreen
              ></div>
            </div>
          )
        )}
        <VideoControls />
      </div>
      <div
        className={`${videoWrapperClass} ${styles.show_on_mobile}`}
        style={mediaLayout?.style}
      >
        {mobileVideoFile?.value || videoFile?.value ? (
          <video
            ref={mobileVideoRef}
            onClick={
              isIOS() && !hidecontrols?.value ? undefined : handleVideoClick
            }
            width="100%"
            poster={coverUrl?.value}
            autoPlay={autoplay?.value}
            muted={autoplay?.value}
            loop={showloop?.value}
            controls={!hidecontrols?.value}
            webkit-playsinline="true"
            playsInline
            onPause={() => setShowOverlay(true)}
            onEnded={() => setShowOverlay(true)}
            onPlay={() => setShowOverlay(false)}
            onLoadedData={() => setIsLoading(false)}
            onProgress={() => setIsLoading(false)}
            preload="auto"
            src={getMobileVideoSource || getVideoSource}
            allowFullScreen
            className={`${styles.mediaFill} ${styles.videoElement}`}
          ></video>
        ) : (
          isYoutube() &&
          VideoUrlValue &&
          isMobile && (
            <div className={`${styles.youtube_wrapper} ${styles.mediaFill}`}>
              <div
                className={styles.yt_video}
                ref={ytVideoRef}
                id={`yt-video-${getYTVideoID(mobileVideoUrl?.value)}`}
                data-videoid={getYTVideoID(mobileVideoUrl?.value)}
                data-videometa={JSON.stringify(props)}
                allowFullScreen
              ></div>
            </div>
          )
        )}
        <VideoControls />
      </div>
    </section>
  );
}

export const settings = {
  label: "t:resource.sections.hero_video.hero_video",
  props: [
    {
      type: "video",
      id: "mobileVideoFile",
      default: false,
      label: "t:resource.sections.hero_video.mobile_primary_video",
    },
    {
      id: "mobileVideoUrl",
      type: "text",
      label: "t:resource.sections.hero_video.mobile_video_url",
      default: "",
      info: "t:resource.sections.hero_video.video_support_mp4_youtube",
    },
    {
      type: "video",
      id: "videoFile",
      default: false,
      label: "t:resource.sections.hero_video.primary_video",
    },
    {
      id: "videoUrl",
      type: "text",
      label: "t:resource.sections.hero_video.video_url",
      default: "",
      info: "t:resource.sections.hero_video.video_support_mp4_youtube",
    },
    {
      type: "checkbox",
      id: "autoplay",
      default: true,
      label: "t:resource.sections.hero_video.autoplay",
      info: "t:resource.sections.hero_video.enable_autoplay_muted",
    },
    {
      type: "checkbox",
      id: "hidecontrols",
      default: true,
      label: "t:resource.sections.hero_video.hide_video_controls",
      info: "t:resource.sections.hero_video.disable_video_controls",
    },
    {
      type: "checkbox",
      id: "showloop",
      default: true,
      label: "t:resource.sections.hero_video.play_video_loop",
      info: "t:resource.sections.hero_video.disable_video_loop",
    },
    {
      type: "checkbox",
      id: "is_pause_button",
      default: true,
      label: "t:resource.sections.hero_video.display_pause_on_hover",
      info: "t:resource.sections.hero_video.display_pause_on_hover_info",
    },
    {
      type: "text",
      id: "title",
      default: "",
      label: "t:resource.common.heading",
    },
    {
      id: "coverUrl",
      type: "image_picker",
      label: "t:resource.sections.hero_video.thumbnail_image",
      default: "",
      options: {
        aspect_ratio: "16:9",
      },
    },
    {
      id: "height_mode",
      type: "select",
      label: "t:resource.common.height_mode",
      default: "auto",
      options: [
        { value: "auto", text: "t:resource.common.auto" },
        { value: "fixed_height", text: "t:resource.common.fixed_height" },
        { value: "aspect_ratio", text: "t:resource.common.aspect_ratio" },
      ],
    },
    {
      type: "text",
      id: "desktop_height",
      label: "t:resource.common.desktop_height",
      info: "t:resource.common.desktop_height_info",
    },
    {
      type: "text",
      id: "mobile_height",
      label: "t:resource.common.mobile_height",
      info: "t:resource.common.mobile_height_info",
    },
    {
      type: "text",
      id: "desktop_aspect_ratio",
      label: "t:resource.common.desktop_aspect_ratio",
      info: "t:resource.common.aspect_ratio_help_text",
    },
    {
      type: "text",
      id: "mobile_aspect_ratio",
      label: "t:resource.common.mobile_aspect_ratio",
      info: "t:resource.common.aspect_ratio_help_text",
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.top_padding",
      default: 0,
      info: "t:resource.sections.categories.top_padding_for_section",
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.bottom_padding",
      default: 16,
      info: "t:resource.sections.categories.bottom_padding_for_section",
    },
  ],
};
export default Component;
