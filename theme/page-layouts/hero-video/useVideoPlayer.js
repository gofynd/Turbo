// useVideoPlayer.js
import { useEffect, useMemo, useRef, useState } from "react";
import { isRunningOnClient } from "../../helper/utils";
import { useViewport } from "../../helper/hooks";

export function useVideoPlayer({
  videoUrl,
  mobileVideoUrl,
  videoFile,
  mobileVideoFile,
  autoplay,
  hidecontrols,
  showloop,
  globalConfig,
}) {
  const videoRef = useRef(null);
  const mobileVideoRef = useRef(null);
  const ytVideoRef = useRef(null);

  const [showOverlay, setShowOverlay] = useState(!autoplay?.value);
  const [ytOverlay, setYtOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const isMobile = useViewport(0, 500);

  const isValidURL = (url) => {
    try {
      return Boolean(new URL(url));
    } catch {
      return false;
    }
  };

  const isGdrive = () => {
    if (isMobile && mobileVideoUrl?.value) {
      if (!isValidURL(mobileVideoUrl?.value)) return false;
      const urlObj = new URL(mobileVideoUrl?.value);
      return urlObj.host.includes("drive.google.com");
    }
    if (!isValidURL(videoUrl?.value)) return false;
    const urlObj = new URL(videoUrl?.value);
    return urlObj.host.includes("drive.google.com");
  };

  const getGdriveVideoUrl = () => {
    if (
      (videoUrl && isValidURL(videoUrl?.value)) ||
      (mobileVideoUrl && isValidURL(mobileVideoUrl?.value))
    ) {
      let urlObj = null;
      if (isMobile && mobileVideoUrl?.value) {
        urlObj = new URL(mobileVideoUrl?.value);
      } else {
        urlObj = new URL(videoUrl?.value);
      }
      const parts = urlObj.pathname.split("/");
      const fileId = parts[parts.indexOf("d") + 1];
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return "";
  };

  const getVideoSource = useMemo(() => {
    if (videoFile?.value) return videoFile?.value;
    if (isGdrive()) return getGdriveVideoUrl();
    return videoUrl?.value;
  }, [videoFile?.value, videoUrl?.value]);

  const getMobileVideoSource = useMemo(() => {
    if (mobileVideoFile?.value) return mobileVideoFile?.value;
    if (isGdrive()) return getGdriveVideoUrl();
    if (mobileVideoUrl?.value) return mobileVideoUrl?.value;
    return videoUrl?.value;
  }, [mobileVideoFile?.value, mobileVideoUrl?.value]);

  const playMp4 = () => {
    setShowOverlay(false);
    if (isMobile && mobileVideoRef.current) {
      mobileVideoRef?.current?.play();
      return;
    }
    if (videoRef.current) videoRef?.current?.play();
  };

  const stopMp4 = () => {
    setShowOverlay(true);
    if (isMobile && mobileVideoRef?.current) {
      mobileVideoRef?.current?.pause();
      return;
    }
    if (videoRef.current) videoRef.current.pause();
  };

  const getYTVideoID = () => {
    if (!isValidURL(videoUrl?.value)) return null;
    const urlObj = new URL(videoUrl?.value);
    const { hostname, pathname, searchParams } = urlObj;

    if (hostname.includes("youtu.be")) return pathname.slice(1);
    if (hostname.includes("youtube.com")) {
      if (pathname.startsWith("/watch")) return searchParams.get("v");
      if (pathname.startsWith("/embed/")) return pathname.split("/embed/")[1];
    }
    return null;
  };

  const isIOS = () => {
    if (isRunningOnClient?.()) {
      return /iPhone|iPad|iPod/.test(navigator.userAgent);
    }
    return false;
  };

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

  // YouTube script management
  const onYouTubeIframeAPIReady = () => {
    // ---- MINIMAL CHANGE: guard to ensure Player constructor exists ----
    if (!isRunningOnClient() || !window?.YT || !window?.YT?.Player) {
      return;
    }

    const ytVideo = ytVideoRef.current;
    window.players = { ...(window.players || {}) };
    const { players } = window;

    if (ytVideo) {
      const videoID = ytVideo.dataset.videoid;
      if (!players[videoID]) players[videoID] = {};

      const videoMeta = JSON.parse(ytVideo.dataset.videometa || "{}");
      const qautoplay = videoMeta?.autoplay?.value ? 1 : 0;
      const qcontrols = videoMeta?.hidecontrols?.value ? 0 : 1;
      const qmute = videoMeta?.autoplay?.value;
      const qloop = !showloop?.value ? 0 : 1;

      players[videoID].onReady = (e) => {
        if (qmute) e.target.mute();
        else e.target.unMute();
        if (qautoplay) e.target.playVideo();
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
            p[videoID].inst.playVideo();
            p[videoID].inst.seekTo(0);
          } else {
            setShowOverlay(true);
          }
        }
      };

      // ---- MINIMAL CHANGE: use window.YT.Player and try/catch ----
      try {
        if (window.YT && window.YT.Player) {
          players[videoID].inst = new window.YT.Player(`yt-video-${videoID}`, {
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
      } catch (err) {
        // swallow - avoid uncaught exception
      }
    }
  };

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
    const { players } = window || {};
    if (players) {
      Object.keys(players).forEach((k) => {
        if (players[k]?.inst) {
          try {
            players[k].inst.destroy();
          } catch {}
        }
      });
      window.players = null;
    }

    const nodes = document.querySelectorAll("[data-ytscript]");
    nodes.forEach((el) => {
      if (el?.parentNode) {
        try {
          el.parentNode.removeChild(el);
        } catch {}
      }
    });

    // ---- MINIMAL CHANGE: DO NOT set window.YT = undefined ----
    // Removing YT global breaks other consumers on the same page.
  };

  const playYT = () => {
    const videoID = ytVideoRef.current?.dataset?.videoid;
    const p = window.players;
    if (p?.[videoID]?.inst) {
      p[videoID]?.inst?.playVideo();
      setShowOverlay(false);
    }
  };

  const stopYT = () => {
    const videoID = ytVideoRef.current?.dataset?.videoid;
    const p = window.players;
    if (p?.[videoID]?.inst) {
      p[videoID].inst.pauseVideo();
      setShowOverlay(true);
    }
  };

  const closeVideo = () => {
    if (videoFile?.value || (isMobile && mobileVideoFile?.value) || isGdrive())
      stopMp4();
    else stopYT();
  };

  const playVideo = () => {
    if (
      videoFile?.value ||
      (isMobile && mobileVideoFile?.value) ||
      isGdrive()
    ) {
      playMp4();
    } else playYT();
  };

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) return [];
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

  const handleVideoClick = (event) => {
    event?.stopPropagation?.();
    event?.preventDefault?.();
    if (isMobile) {
      if (!mobileVideoRef?.current) return;
      if (!mobileVideoRef?.current.paused) mobileVideoRef.current.pause();
      else mobileVideoRef.current.play();
    } else {
      if (!videoRef.current) return;
      if (!videoRef.current.paused) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  useEffect(() => {
    if (isMobile && mobileVideoUrl?.value) {
      setIsValidUrl(isValidURL(mobileVideoUrl?.value));
      return;
    }
    setIsValidUrl(isValidURL(videoUrl?.value));
  }, [videoUrl?.value, mobileVideoUrl?.value]);

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
    // if (isYoutube(videoUrl?.value) && !videoFile?.value) {
    //   setShowOverlay(false);
    //   removeYTScript();
    // }

    setTimeout(() => {
      if (isYoutube(videoUrl?.value) && isRunningOnClient()) {
        loadYTScript();
      }
    }, 0);
  }, [videoUrl, videoFile, autoplay, hidecontrols, showloop]);

  useEffect(() => {
    return () => {
      removeYTScript();
    };
  }, []);

  return {
    videoRef,
    ytVideoRef,
    showOverlay,
    ytOverlay,
    isLoading,
    isValidUrl,
    isMobile,
    getVideoSource,
    getImgSrcSet,
    getYTVideoID,
    playVideo,
    closeVideo,
    handleVideoClick,
    isIOS,
    isYoutube,
    setShowOverlay,
    setIsLoading,
    getMobileVideoSource,
    mobileVideoRef,
  };
}
