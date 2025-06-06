import Pixelbin, { transformations } from "@pixelbin/core";
import {
  DEFAULT_CURRENCY_LOCALE,
  DEFAULT_UTC_LOCALE,
  DIRECTION_ADAPTIVE_CSS_PROPERTIES,
  FLOAT_MAP,
  TEXT_ALIGNMENT_MAP,
} from "./constant";

export const debounce = (func, wait) => {
  let timeout;
  const debouncedFunction = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(function applyFunc() {
      func.apply(this, args);
    }, wait);
  };
  return debouncedFunction;
};

export const getGlobalConfigValue = (globalConfig, id) =>
  globalConfig?.props?.[id] ?? "";

export const getSocialIcon = (title) =>
  title && typeof title === "string" ? `footer-${title.toLowerCase()}` : "";

export function replaceQueryPlaceholders(queryFormat, value1, value2) {
  return queryFormat.replace("{}", value1).replace("{}", value2);
}

export const singleValuesFilters = {
  sortOn: true,
};

export function capitalize(str) {
  if (!str) return str; // Return the string as-is if it's empty or undefined
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const numberWithCommas = (number = 0) => {
  let num = number;
  if (number?.toString()[0] === "-") {
    num = number?.toString()?.substring(1);
  }

  if (num) {
    let no =
      num?.toString()?.split(".")?.[0]?.length > 3
        ? `${num
            ?.toString()
            ?.substring(0, num?.toString()?.split(".")[0].length - 3)
            ?.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${num
            ?.toString()
            ?.substring(num?.toString()?.split(".")?.[0]?.length - 3)}`
        : num?.toString();

    if (number?.toString()[0] === "-") {
      no = `-${no}`;
    }
    return no;
  }
  return 0;
};
export function isRunningOnClient() {
  if (typeof window !== "undefined") {
    return globalThis === window;
  }

  return false;
}

export const copyToClipboard = (str) => {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
};

export function convertDate(dateString, locale = "en-US") {
  const date = new Date(dateString);

  const options = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "UTC",
  };

  const formatter = new Intl.DateTimeFormat(locale, options);
  const formattedDate = formatter.format(date);

  return formattedDate;
}

export const convertUTCDateToLocalDate = (date, format, locale = "en-US") => {
  let frm = format;
  if (!frm) {
    frm = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
  }
  const utcDate = new Date(date);
  // Convert the UTC date to the local date using toLocaleString() with specific time zone
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const options = {
    ...frm,
    timeZone: browserTimezone,
  };
  // Convert the UTC date and time to the desired format
  const formattedDate = utcDate
    .toLocaleString(locale, options)
    .replace(" at ", ", ");
  return formattedDate;
};

export function validateName(name) {
  const regexp = /^[a-zA-Z0-9-_'. ]+$/;
  return regexp.test(String(name).toLowerCase().trim());
}

export function validateEmailField(value) {
  const emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailPattern.test(value);
}

export function validatePhone(phoneNo) {
  const re = /^[0-9]{10}$/;
  return phoneNo && phoneNo.length && re.test(phoneNo.trim());
}

export function validatePasswordField(value) {
  const passwordPattern =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[`~\!@#\$%\^\&\*\(\)\-_\=\+\[\{\}\]\\|;:\'",<.>\/\?€£¥₹§±])[A-Za-z\d`~\!@#\$%\^\&\*\(\)\-_\=\+\[\{\}\]\\|;:\'",<.>\/\?€£¥₹§±]{8,}$/;
  return passwordPattern.test(value);
}

export function checkIfNumber(value) {
  const numberPattern = /^[0-9]+$/;
  return numberPattern.test(value);
}

export function isEmptyOrNull(obj) {
  return (
    obj === null ||
    obj === undefined ||
    (typeof obj === "object" && Object.keys(obj).length === 0)
  );
}

export const transformImage = (url, width) => {
  let updatedUrl = url;
  try {
    const obj = Pixelbin.utils.urlToObj(url);
    if (width) {
      const pixelbin = new Pixelbin({
        cloudName: obj.cloudName,
        zone: obj.zone || "default",
      });

      const resizeTransformation = transformations.Basic.resize({
        width,
        dpr: 1,
      });

      updatedUrl = pixelbin
        .image(obj.workerPath)
        .setTransformation(resizeTransformation)
        .getUrl();
    }
  } catch (error) {
    console.warn("Error processing the URL:", error.message);
  }
  return updatedUrl;
};

export function updateGraphQueryWithValue(mainString, replacements) {
  if (!mainString || !replacements || !Array.isArray(replacements)) {
    return mainString;
  }
  let mStr = mainString;
  // Iterate over the replacements and replace each occurrence in the main string
  replacements.forEach((replacement) => {
    const [search, replaceWith] = replacement;
    if (search && replaceWith) {
      mStr = mainString.split(search).join(replaceWith);
    }
  });
  return mStr;
}

export function throttle(func, wait) {
  let waiting = false;

  function throttleHandler(...args) {
    if (waiting) {
      return;
    }

    waiting = true;
    setTimeout(function executeFunction() {
      func.apply(this, args);
      waiting = false;
    }, wait);
  }

  return throttleHandler;
}

export const detectMobileWidth = () => {
  if (isRunningOnClient()) {
    if (window && window.screen?.width <= 768) {
      return true;
    }
    return false;
  }
};

export function sanitizeHTMLTag(data) {
  return typeof data === "string" ? data.replace(/[<>"]/g, "") : "";
}

export const getProductImgAspectRatio = (
  global_config,
  defaultAspectRatio = 0.8
) => {
  const productImgWidth = global_config?.product_img_width;
  const productImgHeight = global_config?.product_img_height;
  if (productImgWidth && productImgHeight) {
    const aspectRatio = Number(productImgWidth / productImgHeight).toFixed(2);
    return aspectRatio >= 0.6 && aspectRatio <= 1
      ? aspectRatio
      : defaultAspectRatio;
  }

  return defaultAspectRatio;
};

export const currencyFormat = (value, currencySymbol, locale = "en-IN") => {
  // Check if value is defined (including 0) and currencySymbol is provided
  if (value != null) {
    const formattedValue = value.toLocaleString(locale);

    // If currencySymbol is a valid uppercase currency code
    if (currencySymbol && /^[A-Z]+$/.test(currencySymbol)) {
      return `${currencySymbol} ${formattedValue}`;
    }

    // If currencySymbol is provided, attach it without space
    if (currencySymbol) {
      return `${currencySymbol}${formattedValue}`;
    }

    // Return formatted value without currencySymbol
    return formattedValue;
  }

  // Handle cases where value is null or undefined
  return "";
};

export const getReviewRatingData = (customMeta) => {
  const data = {};

  if (customMeta && customMeta.length) {
    customMeta.forEach((item) => {
      if (item.key) {
        data[item.key] = Number(item?.value || "");
      }
    });

    const avgRating = data.rating_sum / data.rating_count;

    data.avg_ratings = Number(Number(avgRating).toFixed(1)) || 0;
  }

  return data;
};
export function removeCookie(name) {
  if (isRunningOnClient()) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

export function getCookie(key) {
  if (isRunningOnClient()) {
    const name = `${key}=`;
    const decoded = decodeURIComponent(document.cookie);
    const cArr = decoded.split("; ");
    let res;
    cArr.forEach((val) => {
      if (val.indexOf(name) === 0) res = val.substring(name.length);
    });
    if (!res) {
      return "";
    }
    try {
      return JSON.parse(res);
    } catch (e) {
      return res || null;
    }
  } else {
    return null;
  }
}

export const getValidLocales = (languagesList) => {
  return languagesList.map((lang) => lang.locale);
};

export const formatLocale = (locale, countryCode, isCurrencyLocale = false) => {
  if ((locale === "en" || !locale) && isCurrencyLocale) {
    return DEFAULT_CURRENCY_LOCALE;
  }
  if (locale === "en" || !locale) {
    return DEFAULT_UTC_LOCALE;
  }
  if (locale.includes("-")) {
    return locale;
  }
  return `${locale}${countryCode ? "-" + countryCode : ""}`;
};

export const getDirectionAdaptiveValue = (cssProperty, value) => {
  switch (cssProperty) {
    case DIRECTION_ADAPTIVE_CSS_PROPERTIES.TEXT_ALIGNMENT:
      return TEXT_ALIGNMENT_MAP[value];
    case DIRECTION_ADAPTIVE_CSS_PROPERTIES.FLOAT:
      return FLOAT_MAP[value];
    default:
      return value;
  }
};
export function createFieldValidation(field, t) {
  if (!field) return () => {};
  const {
    display_name,
    required,
    validation: { type, regex },
  } = field;
  return (value) => {
    if (required && !value) {
      return `${display_name} ${t("resource.common.address.is_required")}.`;
    }

    if ((required || value) && type === "regex" && regex?.value) {
      try {
        const regExp = new RegExp(regex.value);
        if (!regExp.test(value)) {
          return `${t("resource.common.invalid")} ${display_name}`;
        }
      } catch (error) {
        return `${t("resource.common.invalid")} ${display_name}`;
      }
    }
    const { min, max } = regex?.length || {};
    if (
      (required || value) &&
      ((max && value.length > max) || (min && value.length < min))
    ) {
      return `${display_name} ${t("resource.common.validation_length", { min: min || 0, max: max || "∞" })}`;
    }
    return true;
  };
}

export function createLocalitiesPayload(slug, fieldsMap, values) {
  if (!slug) return {};
  const field = fieldsMap?.[slug];
  let result = {};
  if (field?.prev) {
    result = {
      ...result,
      ...createLocalitiesPayload(field?.prev, fieldsMap, values),
    };
  }
  result[slug] = values?.[slug]?.display_name || values?.[slug] || undefined;
  return result;
}

export const resetScrollPosition = () => {
  if (typeof window !== "undefined") {
    window?.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }
};

export const getConfigFromProps = (props) => {
  const getConfigValue = (key) => ({ [key]: props?.[key]?.value });

  return Object.keys(props)?.reduce(
    (acc, curr) => ({ ...getConfigValue(curr), ...acc }),
    {}
  );
};

export function getLocalizedRedirectUrl(path = "", currentLocale) {
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // If we have a non-English locale and path doesn't already have it
  if (
    currentLocale &&
    currentLocale !== "en" &&
    !normalizedPath.startsWith(`/${currentLocale}`)
  ) {
    return `/${currentLocale}${normalizedPath}`;
  }

  return normalizedPath;
}
