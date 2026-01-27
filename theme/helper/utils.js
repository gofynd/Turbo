import Pixelbin, { transformations } from "@pixelbin/core";
import {
  DEFAULT_CURRENCY_LOCALE,
  DEFAULT_UTC_LOCALE,
  DIRECTION_ADAPTIVE_CSS_PROPERTIES,
  FLOAT_MAP,
  TEXT_ALIGNMENT_MAP,
} from "./constant";
import { useEffect, useState } from "react";

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

export const useMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!isRunningOnClient()) return;
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window?.innerWidth <= breakpoint);
      }
    };

    handleResize();

    window?.addEventListener("resize", handleResize);
    return () => {
      window?.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
};

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

// Convert ISO date string to DD-MM-YYYY format
export function convertISOToDDMMYYYY(isoString) {
  if (!isoString) return "";

  // Extract date part from ISO string (YYYY-MM-DD) to avoid timezone issues
  // For DOB, we only care about the date, not the time
  const datePart = isoString.split("T")[0];
  if (!datePart) return "";

  const parts = datePart.split("-");
  if (parts.length !== 3) {
    // Fallback to Date object parsing if format is unexpected
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Convert from YYYY-MM-DD to DD-MM-YYYY
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}

// Convert DD-MM-YYYY format to ISO string
export function convertDDMMYYYYToISO(dateString) {
  if (!dateString) return "";
  const parts = dateString.split("-").map(Number);
  if (parts.length !== 3) return "";
  // Assuming DD-MM-YYYY format
  // Use Date.UTC to create date in UTC timezone to avoid timezone shift issues
  const dateObj = new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
  if (isNaN(dateObj.getTime())) return "";
  return dateObj.toISOString();
}

export const convertUTCDateToLocalDate = (date, format, locale = "en-US") => {
  if (!date) {
    return "Invalid date";
  }

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

  try {
    const utcDate = new Date(date);

    if (Number.isNaN(utcDate.getTime())) {
      return "Invalid date";
    }

    // Convert the UTC date to the local date using toLocaleString() with specific time zone
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const options = {
      ...frm,
      timeZone: browserTimezone,
    };
    // Convert the UTC date and time to the desired format
    const formattedDate = utcDate
      .toLocaleString(locale, options)
      .replace(" at ", ", ");
    return formattedDate;
  } catch (error) {
    return "Invalid date";
  }
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

export function sanitizeMetaDescription(data) {
  if (typeof data !== "string") return "";
  return data
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .replace(/"/g, "")
    .trim();
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
  const formattingLocale = `${locale}-u-nu-latn`;

  if (value != null) {
    const formattedValue = value.toLocaleString(formattingLocale);

    if (currencySymbol && /^[A-Z]+$/.test(currencySymbol)) {
      return `${currencySymbol} ${formattedValue}`;
    }

    if (currencySymbol) {
      return `${currencySymbol}${formattedValue}`;
    }

    return formattedValue;
  }

  return "";
};

export function roundToDecimals(number, decimalPlaces = 2) {
  const factor = 10 ** decimalPlaces;
  return Math.round(number * factor) / factor;
}

export function priceFormatCurrencySymbol(symbol, price = 0) {
  const hasAlphabeticCurrency = /^[A-Za-z]+$/.test(symbol);
  let sanitizedPrice = price;
  if (typeof price !== "string") {
    let num = price;

    if (!Number.isNaN(price)) num = roundToDecimals(price);
    if (num?.toString()[0] === "-") {
      num = num?.toString()?.substring(1);
    }

    if (num) {
      sanitizedPrice =
        num?.toString()?.split(".")?.[0].length > 3
          ? `${num
              ?.toString()
              ?.substring(0, num?.toString()?.split(".")?.[0]?.length - 3)
              ?.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${num
              ?.toString()
              ?.substring(num?.toString()?.split?.(".")?.[0]?.length - 3)}`
          : num?.toString();
    } else {
      sanitizedPrice = 0;
    }
  }

  return `${price.toString()[0] === "-" ? "-" : ""}${
    hasAlphabeticCurrency
      ? `${symbol} ${sanitizedPrice}`
      : `${symbol}${sanitizedPrice}`
  }`;
}

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

const isValidLocale = (tag) => {
  try {
    new Intl.Locale(tag);
    return true;
  } catch {
    return false;
  }
};

export const formatLocale = (locale, countryCode, isCurrencyLocale = false) => {
  if ((locale === "en" || !locale) && isCurrencyLocale) {
    return DEFAULT_CURRENCY_LOCALE;
  }
  if (locale === "en" || !locale) {
    return DEFAULT_UTC_LOCALE;
  }
  const finalLocale = locale.includes("-")
    ? locale
    : `${locale}${countryCode ? "-" + countryCode : ""}`;
  return isValidLocale(finalLocale) ? finalLocale : DEFAULT_UTC_LOCALE;
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
  const { slug, display_name, required, validation } = field;
  const { type, regex } = validation || {};
  if (slug === "phone") {
    return (value) => {
      if (required && !value?.mobile?.trim()) {
        return `${display_name} ${t("resource.common.address.is_required")}`;
      }
      // If isValidNumber is explicitly false, fail validation
      if (value && value.isValidNumber === false) {
        return t("resource.common.address.invalid_phone_number");
      }

      // If isValidNumber is missing/undefined but we have a mobile number, validate it ourselves
      if (value && value.mobile && value.isValidNumber === undefined) {
        const mobileNumber = value.mobile.toString().replace(/[\s\-+]/g, "");
        // Basic validation: check if it's a valid length (10 digits for most countries)
        // For India (countryCode 91), validate Indian format
        if (value.countryCode === "91" || !value.countryCode) {
          if (mobileNumber.length !== 10) {
            return t("resource.common.address.invalid_phone_number");
          }
          // Indian mobile numbers should start with 6-9
          if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
            return t("resource.common.address.invalid_phone_number");
          }
        } else {
          // For other countries, just check minimum length (at least 7 digits)
          if (mobileNumber.length < 7) {
            return t("resource.common.address.invalid_phone_number");
          }
        }
        return true;
      }

      // If no value at all, fail
      if (!value) {
        return t("resource.common.address.invalid_phone_number");
      }
      return true;
    };
  }
  return (v) => {
    const value = v?.display_name || v;
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
  if (!props || typeof props !== "object") {
    return {};
  }

  const getConfigValue = (key) => {
    const prop = props[key];
    if (!prop) return { [key]: undefined };

    // Handle different prop structures
    if (prop.value !== undefined) {
      return { [key]: prop.value };
    } else if (prop.type && prop.default !== undefined) {
      return { [key]: prop.default };
    } else {
      return { [key]: prop };
    }
  };

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

export const validateAccounHolder = (value) => {
  // If empty, let the 'required' rule handle it
  if (!value || !value.trim()) {
    return true; // Changed from returning error message
  }

  const trimmedValue = value.trim();

  // Check for numbers
  if (/\d/.test(trimmedValue)) {
    return "resource.refund_order.numbers_not_allowed_in_account_holder_name";
  }

  // Check for special characters
  if (!/^[a-zA-Z\s.',-]+$/.test(trimmedValue)) {
    return "resource.refund_order.special_characters_not_allowed_in_account_holder_name";
  }

  // Minimum length check
  if (trimmedValue.length < 3) {
    return "resource.refund_order.account_holder_name_should_be_at_least_3_characters";
  }

  // Maximum length check
  if (trimmedValue.length > 50) {
    return "resource.refund_order.account_holder_name_should_not_exceed_50_characters";
  }

  return true;
};

export const validateAccountNo = (value) => {
  // If empty, let the 'required' rule handle it
  if (!value) {
    return true; // Changed from returning error message
  }

  const accountNumber = value.toString().replace(/\s/g, "");

  // Check if it contains only digits
  if (!/^\d+$/.test(accountNumber)) {
    return "resource.refund_order.account_number_should_contain_only_numbers";
  }

  // Check minimum length
  if (accountNumber.length < 9) {
    return "resource.refund_order.account_number_should_be_at_least_9_digits";
  }

  // Check maximum length
  if (accountNumber.length > 18) {
    return "resource.refund_order.account_number_should_not_exceed_18_digits";
  }

  return true;
};

export function spaNavigate(path) {
  // SSR / very old browsers
  if (
    typeof window === "undefined" ||
    !window.history ||
    !window.history.pushState
  ) {
    window.location.href = path;
    return;
  }

  const current = window.location.pathname + window.location.search;
  if (current === path) return; // no-op

  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function translateDynamicLabel(input, t) {
  if (input == null || typeof input !== "string") {
    return input ?? "";
  }

  const safeInput = input
    .toLowerCase()
    .replace(/\//g, "_") // replace slashes with underscores
    .replace(/[^a-z0-9_\s]/g, "") // remove special characters except underscores and spaces
    .trim()
    .replace(/\s+/g, "_"); // replace spaces with underscores

  const translationKey = `resource.dynamic_label.${safeInput}`;
  const translated = t(translationKey);

  return translated.split(".").pop() === safeInput ? input : translated;
}
export const getAddressStr = (item, isAddressTypeAvailable) => {
  if (!item || typeof item !== "object") {
    return "";
  }
  try {
    const parts = [
      item.address || "",
      item.area || "",
      item.landmark?.length > 0 ? item.landmark : "",
      item.sector || "",
      item.city || "",
      item.state || "",
    ].filter(Boolean);

    if (isAddressTypeAvailable && item.address_type) {
      parts.unshift(item.address_type);
    }
    let addressStr = parts.join(", ");
    if (item.area_code) {
      addressStr += ` ${item.area_code}`;
    }
    if (item.country) {
      // Handle country as object or string
      const countryStr =
        typeof item.country === "object"
          ? item.country.display_name ||
            item.country.name ||
            item.country.uid ||
            ""
          : item.country;
      if (countryStr) {
        addressStr += `, ${countryStr}`;
      }
    }
    return addressStr;
  } catch (error) {
    console.error("Error constructing address string:", error);
    return "";
  }
};

export const getAddressFromComponents = (components, name) => {
  const typeToName = Object.fromEntries(
    components.flatMap(({ long_name, short_name, types }) =>
      types.map((type) => [type, { short_name, long_name }])
    )
  );

  const address = [
    name,
    typeToName.premise?.long_name || null,
    typeToName.street_number?.long_name || null,
    typeToName.route?.long_name || null,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    address: address || null,
    area: typeToName["sublocality_level_2"]?.long_name || null,
    landmark: typeToName["sublocality_level_1"]?.long_name || null,
    city: typeToName["locality"]?.long_name || null,
    state: typeToName["administrative_area_level_1"]?.long_name || null,
    area_code: typeToName["postal_code"]?.long_name || null,
    country: typeToName["country"]?.long_name || null,
    country_iso_code: typeToName["country"]?.short_name || null,
  };
};

export function getDefaultLocale(locales) {
  const defaultLocaleObj = locales.find((item) => item.is_default === true);
  return defaultLocaleObj ? defaultLocaleObj.locale : null;
}

export function isLocalePresent(locale, localesArray = []) {
  return localesArray.some((item) => item.locale === locale);
}

export function addLocaleToShareCartUrl(url, locale, supportedLocales) {
  try {
    // Extract valid locale codes from supportedLocales.items
    const validLocaleCodes = (supportedLocales?.items || []).map(
      (item) => item.locale
    );

    if (!locale || locale === "en" || !validLocaleCodes.includes(locale))
      return url;

    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);

    // Replace the locale if one is already present
    if (validLocaleCodes.includes(pathSegments[0])) {
      pathSegments[0] = locale;
    } else {
      pathSegments.unshift(locale);
    }

    parsedUrl.pathname = "/" + pathSegments.join("/");
    return parsedUrl.toString();
  } catch (e) {
    console.error("Invalid URL:", e);
    return url;
  }
}

export function getLocaleDirection(fpi) {
  const dir = fpi?.store?.getState()?.custom?.currentLocaleDetails?.direction;
  return dir || "ltr";
}

export function getDiscountPercentage({ markedPrice, effectivePrice }) {
  if (markedPrice === effectivePrice) return;
  return Math.floor(((markedPrice - effectivePrice) / markedPrice) * 100);
}

export function getGroupedShipmentBags(
  bags,
  { includePromoBags = true, isPartialCheck = false } = {}
) {
  if (!bags) {
    return {
      bags: [],
      bundleGroups: {},
      bundleGroupArticles: {},
    };
  }

  const shipmentBags = [];
  const bundleGroups = new Map();
  const bundleGroupArticles = new Map();
  const hasBaseInBag = new Set();
  const bundleGroupRepresentative = new Map(); // Track first item of each bundle group

  for (const bag of bags) {
    const bundleDetails = bag?.bundle_details;
    const bundleGroupId = bundleDetails?.bundle_group_id;
    const isBase = !!bundleDetails?.is_base;
    const isPartialReturn =
      !!bundleDetails?.return_config?.allow_partial_return;

    if (!includePromoBags && Object.keys(bag?.parent_promo_bags)?.length > 0) {
      continue;
    }

    if (bundleGroupId && (!isPartialCheck || !isPartialReturn)) {
      if (isBase && !hasBaseInBag.has(bundleGroupId)) {
        shipmentBags.push(bag);
        hasBaseInBag.add(bundleGroupId);
      } else if (
        !isBase &&
        !hasBaseInBag.has(bundleGroupId) &&
        !bundleGroupRepresentative.has(bundleGroupId)
      ) {
        // If no base item exists yet, use the first child item as representative
        bundleGroupRepresentative.set(bundleGroupId, bag);
      }

      if (!bundleGroups.has(bundleGroupId)) {
        bundleGroups.set(bundleGroupId, []);
        bundleGroupArticles.set(bundleGroupId, new Map());
      }
      bundleGroups.get(bundleGroupId).push(bag);
      bundleGroupArticles
        .get(bundleGroupId)
        .set(bundleDetails?.article_bundle_id, bag);
    } else {
      shipmentBags.push(bag);
    }
  }

  // Add representative items for bundle groups that have no base item
  for (const [bundleGroupId, representativeBag] of bundleGroupRepresentative) {
    if (!hasBaseInBag.has(bundleGroupId)) {
      shipmentBags.push(representativeBag);
    }
  }

  return {
    bags: shipmentBags,
    bundleGroups: Object.fromEntries(bundleGroups),
    bundleGroupArticles: Object.fromEntries(
      [...bundleGroupArticles].map(([id, articles]) => [
        id,
        [...articles.values()],
      ])
    ),
  };
}

/**
 * Format time from hour and minute to 12-hour format with lowercase am/pm
 * @param {number} hour - Hour in 24-hour format (0-23)
 * @param {number} minute - Minute (0-59)
 * @returns {string} Formatted time string (e.g., "8:00am", "11:30pm")
 */
export const formatStoreTime = (hour, minute) => {
  const period = hour >= 12 ? "pm" : "am";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute}${period}`;
};

/**
 * Get today's weekday name
 * @returns {string} Weekday name (e.g., "Monday", "Tuesday")
 */
export const getTodayWeekday = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
};

/**
 * Format order acceptance timing for today
 * @param {Array} timingArray - Array of timing objects with weekday, open, opening, and closing properties
 * @returns {string|null} Formatted timing string (e.g., "Open today: 8:00am - 11:00pm") or null if no timing found
 */
export const formatOrderAcceptanceTiming = (timingArray) => {
  if (!timingArray || !Array.isArray(timingArray) || timingArray.length === 0) {
    return null;
  }

  // Get today's weekday
  const todayWeekday = getTodayWeekday();

  // Find today's timing - try exact match first, then case-insensitive
  let todayTiming = timingArray.find(
    (day) => day.weekday === todayWeekday && day.open === true
  );

  // If not found, try case-insensitive match
  if (!todayTiming) {
    todayTiming = timingArray.find(
      (day) =>
        day.weekday?.toLowerCase() === todayWeekday.toLowerCase() &&
        day.open === true
    );
  }

  // If still not found, try to find any open day as fallback
  if (!todayTiming) {
    todayTiming = timingArray.find((day) => day.open === true);
  }

  // Validate that we have the required data structure
  if (
    !todayTiming ||
    !todayTiming.opening ||
    typeof todayTiming.opening.hour !== "number" ||
    typeof todayTiming.opening.minute !== "number" ||
    !todayTiming.closing ||
    typeof todayTiming.closing.hour !== "number" ||
    typeof todayTiming.closing.minute !== "number"
  ) {
    return null;
  }

  // Format as "Open today: [opening]am - [closing]pm"
  const openingTime = formatStoreTime(
    todayTiming.opening.hour,
    todayTiming.opening.minute
  );
  const closingTime = formatStoreTime(
    todayTiming.closing.hour,
    todayTiming.closing.minute
  );

  return `Open today: ${openingTime} - ${closingTime}`;
};
