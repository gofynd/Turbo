import { useCallback } from "react";
import { useThemeConfig } from "./useThemeConfig";
import { useThemeFeature } from "./useThemeFeature";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { convertUTCDateToLocalDate, formatLocale } from "../utils";

const roundToNearestHour = (date) => {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();

  if (minutes >= 30) {
    rounded.setHours(rounded.getHours() + 1);
  }
  rounded.setMinutes(0, 0, 0); // Reset minutes, seconds, milliseconds

  return rounded;
};

const setEndOfDay = (date) => {
  date.setHours(23, 59, 59, 999);
  return date;
};

export const useDeliverPromise = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const { isServiceabilityPromise } = useThemeFeature({ fpi });
  const { globalConfig } = useThemeConfig({ fpi });

  const isClient = typeof window !== "undefined";
  const { language, countryCode = "IN" } = isClient
    ? useGlobalStore(fpi?.getters?.i18N_DETAILS)
    : { language: { locale: "en" }, countryCode: "IN" };
  const locale = language?.locale || "en";

  const {
    serviceability_max_min,
    serviceability_max_hour,
    delivery_promise_type = "min",
  } = globalConfig;

  const getDeliveryPromise = useCallback(
    (key, promise) => {
      const timestamp = key == "min" ? promise?.min : promise?.max;
      if (!timestamp) {
        return t("resource.localization.provide_valid_time");
      }

      const deliveryTime = new Date(timestamp);

      // const currentTimeStamp = new Date(timestamp);
      // const timezoneOffsetInMs =
      //   currentTimeStamp.getTimezoneOffset() * 60 * 1000;
      // const deliveryTime = new Date(
      //   currentTimeStamp.getTime() + timezoneOffsetInMs
      // );

      const now = new Date();
      const today = setEndOfDay(new Date());
      const tomorrow = setEndOfDay(new Date(now.getTime() + 86400000)); // +1 day

      const diffInMins = Math.ceil((deliveryTime - now) / 60000);
      const diffInHours = Math.ceil((deliveryTime - now) / 3600000);
      const time = convertUTCDateToLocalDate(
        roundToNearestHour(deliveryTime),
        {
          hour: "numeric",
          hour12: true,
        },
        formatLocale(locale, countryCode, true)
      );

      const maxDeliveryMinutes = Number(serviceability_max_min) || 0;
      const maxDeliveryHours = Number(serviceability_max_hour) || 0;
      if (key === "range" && promise?.min < promise?.max) {
        return `${t("resource.header.get_it_by", {
          time: ` ${convertUTCDateToLocalDate(
            promise?.min,
            { weekday: "short", day: "numeric", month: "short" },
            formatLocale(locale, countryCode, true)
          )}  -  ${convertUTCDateToLocalDate(
            promise?.max,
            { weekday: "short", day: "numeric", month: "short" },
            formatLocale(locale, countryCode, true)
          )}`,
        })}`;
      }

      if (diffInMins > 0 && diffInMins <= maxDeliveryMinutes) {
        return t(
          diffInMins > 1
            ? "resource.header.delivery_time_mins"
            : "resource.header.delivery_time_min",
          { min: diffInMins }
        );
      } else if (
        diffInMins > maxDeliveryMinutes &&
        diffInHours <= maxDeliveryHours
      ) {
        return t(
          diffInHours > 1
            ? "resource.header.delivery_time_hours"
            : "resource.header.delivery_time_hour",
          { hr: diffInHours }
        );
      } else if (deliveryTime <= today) {
        return `${t("resource.header.delivery_today_by_time", { time: time.toUpperCase().replace(/\s/g, "") })}`;
      } else if (deliveryTime > today && deliveryTime <= tomorrow) {
        return `${t("resource.header.delivery_tomorrow_by_time", { time: time.toUpperCase().replace(/\s/g, "") })}`;
      } else {
        const deliveryBy = convertUTCDateToLocalDate(
          deliveryTime,
          { weekday: "short", day: "numeric", month: "short" },
          formatLocale(locale, countryCode, true)
        );
        return `${t("resource.common.delivery_by", { date: deliveryBy })}`;
      }
    },
    [serviceability_max_min, serviceability_max_hour, locale, countryCode]
    // [globalConfig, locale, countryCode, t]
  );

  const getFormattedPromise = useCallback(
    (promise) => {
      
      if (!promise) {
        return;
      }

      return getDeliveryPromise(delivery_promise_type, promise);
    },
    [delivery_promise_type, getDeliveryPromise]
  );

  return {
    getFormattedPromise,
  };
};
