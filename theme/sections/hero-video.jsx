import React, { useState, useEffect, useRef } from "react";
import { detectMobileWidth, isRunningOnClient } from "../helper/utils";
import styles from "../styles/sections/hero-video.less";
import placeholderImage from "../assets/images/placeholder/hero-video.png";
import { useGlobalTranslation } from "fdk-core/utils";
import PlayIcon from "../assets/images/play.svg";
import PauseIcon from "../assets/images/pause.svg";

export function Component({ props, globalConfig }) {
  const {
    videoFile,
    videoUrl,
    autoplay,
    hidecontrols,
    showloop,
    is_pause_button,
    title,
    coverUrl,
    padding_top,
    padding_bottom,
  } = props;
  const { t } = useGlobalTranslation("translation");
  const [showOverlay, setShowOverlay] = useState(!autoplay?.value);
  const [ytOverlay, setYtOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const ytVideoRef = useRef(null);

  function isValidURL(url) {
    try {
      return Boolean(new URL(url));
    } catch (e) {
      return false;
    }
  }

  function isGdrive() {
    if (!isValidURL(videoUrl?.value)) return false;
    const urlObj = new URL(videoUrl?.value);
    return urlObj.host.includes("drive.google.com");
  }

  function getGdriveVideoUrl() {
    if (videoUrl && isValidURL(videoUrl?.value)) {
      const urlObj = new URL(videoUrl?.value);
      const v = urlObj.pathname.split("/");
      const fileId = v[v.indexOf("d") + 1];
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    return "";
  }

  function getVideoSource() {
    if (videoFile?.value) {
      return videoFile?.value;
    }
    if (isGdrive()) {
      return getGdriveVideoUrl();
    }
    return videoUrl?.value;
  }

  function playMp4() {
    setShowOverlay(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  }

  function stopMp4() {
    setShowOverlay(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }

  function getYTVideoID() {
    if (!isValidURL(videoUrl?.value)) return null;
    const urlObj = new URL(videoUrl?.value);
    const { hostname, pathname, searchParams } = urlObj;

    if (hostname.includes("youtu.be")) {
      return pathname.slice(1); // /VIDEO_ID
    }

    if (hostname.includes("youtube.com")) {
      if (pathname.startsWith("/watch")) {
        return searchParams.get("v");
      }
      if (pathname.startsWith("/embed/")) {
        return pathname.split("/embed/")[1];
      }
    }

    return null;
  }

  function isIOS() {
    if (isRunningOnClient()) {
      return /iPhone|iPad|iPod/.test(navigator.userAgent);
    }
  }

  // function getYTVideoID() {
  //   if (!isValidURL(videoUrl?.value)) return null;
  //   const urlObj = new URL(videoUrl?.value);
  //   const { searchParams } = urlObj;
  //   let v = searchParams.get("v");
  //   if (urlObj.host.includes("youtu.be")) {
  //     v = urlObj.pathname.split("/").pop();
  //   }
  //   return v;
  // }

  useEffect(() => {
    setIsMobile(detectMobileWidth());
  }, []);

  useEffect(() => {
    setIsValidUrl(isValidURL(videoUrl?.value));
  }, [videoUrl]);

  function isYoutube() {
    if (!videoUrl?.value || !isValidURL(videoUrl?.value)) {
      return false;
    }
    const urlObj = new URL(videoUrl?.value);
    if (isRunningOnClient()) {
      return (
        urlObj.host.includes("youtu.be") || urlObj.host.includes("youtube.com")
      );
    }
    return false;
  }

  const loadYTScript = () => {
    const nodes = document.querySelectorAll("[data-ytscript]");
    if (nodes.length === 0) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.dataset.ytscript = "true";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      tag.onload = () => {
        if (!window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady = () => {
            setTimeout(onYouTubeIframeAPIReady, 500);
          };
        } else {
          setTimeout(onYouTubeIframeAPIReady, 500);
        }
      };
    } else if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = () => {
        setTimeout(onYouTubeIframeAPIReady, 500);
      };
    } else {
      setTimeout(onYouTubeIframeAPIReady, 500);
    }
    setIsLoading(true);
  };

  const removeYTScript = () => {
    const { players } = window;
    // Destroy any existing YouTube player instances
    if (players) {
      Object.keys(players).forEach((item) => {
        if (players[item].inst) {
          players[item].inst.destroy();
        }
      });
      window.players = null;
    }

    // Find all elements with the "data-ytscript" attribute
    const nodes = document.querySelectorAll("[data-ytscript]");

    // Safely remove each element, but ensure it is still part of the DOM
    nodes.forEach((element) => {
      if (element && element?.parentNode) {
        try {
          element?.parentNode?.removeChild(element);
        } catch (err) {
          console.warn("Error removing script node:", err);
        }
      } else {
        console.warn(
          "Script node is not part of the DOM or already removed:",
          element
        );
      }
    });

    // Unset window.YT if it exists
    if (typeof window.YT !== "undefined") {
      window.YT = undefined;
    }
  };

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1728 }, width: 3564 },
      { breakpoint: { min: 1512 }, width: 3132 },
      { breakpoint: { min: 1296 }, width: 2700 },
      { breakpoint: { min: 1080 }, width: 2250 },
      { breakpoint: { min: 900 }, width: 1890 },
      { breakpoint: { min: 720 }, width: 1530 },
      { breakpoint: { min: 540 }, width: 1170 },
      { breakpoint: { min: 360 }, width: 810 },
      { breakpoint: { min: 180 }, width: 450 },
    ];
  };

  const onYouTubeIframeAPIReady = () => {
    const ytVideo = ytVideoRef.current;
    window.players = { ...window.players };
    const { players } = window;

    if (ytVideo) {
      const videoID = ytVideo.dataset.videoid;
      if (!players[videoID]) {
        players[videoID] = {};
      }

      const videoMeta = JSON.parse(ytVideo.dataset.videometa);
      const qautoplay = videoMeta?.autoplay?.value ? 1 : 0;
      const qcontrols = videoMeta?.hidecontrols?.value ? 0 : 1;
      const qmute = videoMeta?.autoplay?.value;
      const qloop = !showloop?.value ? 0 : 1;

      players[videoID].onReady = (e) => {
        if (qmute) {
          e.target.mute();
        } else {
          e.target.unMute();
        }
        if (qautoplay) {
          e.target.playVideo();
        }
        setIsLoading(false);
      };

      players[videoID].onStateChange = (event) => {
        const p = window.players;
        if (
          event.data === window.YT.PlayerState.PLAYING ||
          event.data === window.YT.PlayerState.BUFFERING
        ) {
          setYtOverlay(true);
          setShowOverlay(false);
        }
        if (event.data === window.YT.PlayerState.PAUSED) {
          setShowOverlay(true);
        }
        if (event.data === window.YT.PlayerState.ENDED) {
          if (qloop === 1) {
            p[videoID].inst.playVideo(); // Loop the video if qloop is 1
            p[videoID].inst.seekTo(0);
          } else {
            setShowOverlay(true); // End the video without looping
          }
        }
      };
      // eslint-disable-next-line no-undef
      players[videoID].inst = new YT.Player(`yt-video-${videoID}`, {
        videoId: videoID,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: qautoplay,
          controls: qcontrols,
          modestbranding: 1,
          mute: qmute,
          loop: qloop,
          fs: 0,
          WebKitPlaysInline: "true",
          playsinline: 1,
          cc_load_policty: 0,
          iv_load_policy: 3,
          origin: document.location.origin,
        },
        events: {
          onReady: players[videoID].onReady,
          onStateChange: players[videoID].onStateChange,
        },
      });
    }
  };

  const playYT = () => {
    const videoID = ytVideoRef.current.dataset.videoid;
    const p = window.players;
    p[videoID].inst.playVideo();
    setShowOverlay(false);
  };

  const stopYT = () => {
    const videoID = ytVideoRef.current.dataset.videoid;
    const p = window.players;
    p[videoID].inst.pauseVideo();
    setShowOverlay(true);
  };

  const closeVideo = () => {
    if (videoFile?.value || isGdrive()) {
      stopMp4();
    } else {
      stopYT();
    }
  };

  const playVideo = () => {
    if (videoFile?.value || isGdrive()) {
      playMp4();
    } else {
      playYT();
    }
  };

  useEffect(() => {
    if (!videoUrl?.value && !videoFile?.value) {
      setShowOverlay(true);
    }
    if (
      (videoUrl?.value && videoFile?.value) ||
      (!videoUrl?.value && videoFile?.value)
    ) {
      setYtOverlay(true);
    }
    if (!videoFile?.value && videoUrl?.value) {
      setYtOverlay(false);
    }
    if (isYoutube(videoUrl?.value) && !videoFile?.value) {
      setShowOverlay(false);
      removeYTScript();
    }

    setTimeout(() => {
      if (isYoutube(videoUrl?.value)) {
        loadYTScript();
      }
    }, 0);
  }, [videoUrl, videoFile, autoplay, hidecontrols, showloop]);

  const handleVideoClick = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (videoRef.current) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 0}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  return (
    <section style={dynamicStyles}>
      {title?.value && (
        <h2 className={`fx-title ${styles.video_heading} fontHeader`}>
          {title?.value}
        </h2>
      )}

      <div className={`${styles.video_container} `}>
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
            src={getVideoSource()}
            allowFullScreen
          ></video>
        ) : (
          isYoutube() &&
          isValidUrl && (
            <div className={styles.youtube_wrapper}>
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
        {!videoFile?.value && !videoUrl?.value && (
          <img
            src={coverUrl?.value || placeholderImage}
            alt={t("resource.common.placeholder")}
            style={{ width: "100%" }}
            srcSet={getImgSrcSet()}
          />
        )}
      </div>
    </section>
  );
}

export const settings = {
  label: "t:resource.sections.hero_video.hero_video",
  props: [
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
