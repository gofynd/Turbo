export const MEDIA_HEIGHT_MODES = {
  AUTO: "auto",
  FIXED: "fixed_height",
  ASPECT_RATIO: "aspect_ratio",
};

const getMode = (mode) => {
  const value = mode?.value ?? mode;
  if (Object.values(MEDIA_HEIGHT_MODES).includes(value)) {
    return value;
  }
  return MEDIA_HEIGHT_MODES.AUTO;
};

export const parseAspectRatio = (value) => {
  if (value == null) return undefined;

  if (typeof value === "number" && !Number.isNaN(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const cleanedValue = value.replace(/\s/g, "");
    const ratioParts =
      cleanedValue.split(":").length > 1
        ? cleanedValue.split(":")
        : cleanedValue.split("/");

    if (ratioParts.length === 2) {
      const [width, height] = ratioParts.map((part) => Number(part));
      if (height > 0 && width > 0) {
        return width / height;
      }
    }

    const numericValue = Number(cleanedValue);
    if (!Number.isNaN(numericValue) && numericValue > 0) {
      return numericValue;
    }
  }

  return undefined;
};

/**
 * Parses a height value for fixed_height mode.
 * Accepts any CSS value: px, vh, vw, %, em, rem, calc(), min(), max(), etc.
 * Unitless values (plain numbers) default to px.
 */
const parseCssHeight = (value) => {
  const raw = String(value?.value ?? value ?? "").trim();
  if (!raw) return null;
  // Unitless (plain number) -> default to px
  if (/^\d+(\.\d+)?$/.test(raw)) {
    return `${raw}px`;
  }
  // User provided value with unit or CSS function - use as-is
  return raw;
};

export const getMediaLayout = (
  {
    height_mode,
    desktop_height,
    mobile_height,
    desktop_aspect_ratio,
    mobile_aspect_ratio,
  } = {},
  isMobile = false,
  fallbackAspectRatio
) => {
  const mode = getMode(height_mode);

  const desktopHeightCss = parseCssHeight(desktop_height?.value ?? desktop_height);
  const mobileHeightCss = parseCssHeight(mobile_height?.value ?? mobile_height);

  const desktopAspect =
    parseAspectRatio(desktop_aspect_ratio?.value ?? desktop_aspect_ratio) ??
    parseAspectRatio(fallbackAspectRatio);
  const mobileAspect =
    parseAspectRatio(mobile_aspect_ratio?.value ?? mobile_aspect_ratio) ??
    desktopAspect;

  const resolvedAspect = isMobile ? mobileAspect : desktopAspect;

  // Desktop and mobile heights are kept separate (no cross-fallback)
  const finalDesktopHeight = desktopHeightCss;
  const finalMobileHeight = mobileHeightCss;


  const desktopPadding = desktopAspect
    ? `${(1 / desktopAspect) * 100}%`
    : undefined;
  const mobilePadding = mobileAspect
    ? `${(1 / mobileAspect) * 100}%`
    : desktopPadding;

  return {
    mode,
    isAspectRatio: mode === MEDIA_HEIGHT_MODES.ASPECT_RATIO && !!resolvedAspect,
    isFixedHeight: mode === MEDIA_HEIGHT_MODES.FIXED ,
    aspectRatio: desktopAspect,
    mobileAspectRatio: mobileAspect,
    style: {
      ...(mode === MEDIA_HEIGHT_MODES.FIXED 
        ? {
            "--media-desktop-height": finalDesktopHeight ?? "auto",
            "--media-mobile-height": finalMobileHeight ?? "auto",
          }
        : {}),
      ...(mode === MEDIA_HEIGHT_MODES.ASPECT_RATIO && resolvedAspect
        ? {
            "--media-aspect-desktop": desktopAspect,
            "--media-aspect-mobile": mobileAspect,
            "--media-fallback-padding-desktop": desktopPadding,
            "--media-fallback-padding-mobile": mobilePadding,
          }
        : {}),
    },
  };
};
