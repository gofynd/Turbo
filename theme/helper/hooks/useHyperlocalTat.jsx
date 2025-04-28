import { useCallback } from "react";
import { useThemeConfig } from "./useThemeConfig";
import {
  useGlobalStore,
  useGlobalTranslation
} from "fdk-core/utils";
import { formatLocale } from "../utils";

export const useHyperlocalTat = ({ fpi }) => {
  const { globalConfig } = useThemeConfig({ fpi });
  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale
  const { t } = useGlobalTranslation("translation");
  const convertUTCToHyperlocalTat = useCallback(
    (timestamp) => {
      if (!timestamp) {
        return t("resource.localization.provide_valid_time");
      }

      const {
        is_delivery_date,
        is_delivery_day,
        is_delivery_hours,
        is_delivery_minutes,
        max_delivery_min,
        max_delivery_hours,
      } = globalConfig;

      if (
        !is_delivery_minutes &&
        !is_delivery_hours &&
        !is_delivery_day &&
        !is_delivery_date
      ) {
        return t("resource.localization.select_delivery_option");
      }

      const setEndOfDay = (date) => {
        date.setHours(23, 59, 59, 999);
        return date;
      };

      const deliveryTime = new Date(timestamp);
      const now = new Date();
      const today = setEndOfDay(new Date());
      const tomorrow = setEndOfDay(
        new Date(new Date().setDate(now.getDate() + 1))
      );

      const diffInMins = Math.ceil((deliveryTime - now) / 60000);
      const diffInHours = Math.ceil((deliveryTime - now) / 3600000);

      const maxDeliveryMinutes = Number(max_delivery_min) || 0;
      const maxDeliveryHours = Number(max_delivery_hours) || 0;

      if (
        diffInMins > 0 &&
        diffInMins <= maxDeliveryMinutes &&
        is_delivery_minutes
      ) {
        return t("resource.header.delivery_time_in_mins", {
          minutes: diffInMins,
        });
      } else if (
        diffInMins > maxDeliveryMinutes &&
        diffInHours <= maxDeliveryHours &&
        is_delivery_hours
      ) {
        return t("resource.header.delivery_time_in_hours", {
          hours: diffInHours,
        });
      } else if (deliveryTime <= today && is_delivery_day) {
        return t("resource.header.delivery_by_today");
      } else if (
        deliveryTime > today &&
        deliveryTime <= tomorrow &&
        is_delivery_day
      ) {
        return t("resource.header.delivery_by_tomorrow");
      } else if (is_delivery_date) {
        return `${t("resource.common.delivery_by")} ${deliveryTime.toLocaleDateString(
          formatLocale(locale, countryCode),
          {
            month: "short",
            day: "numeric",
          }
        )}`;
      } else {
        return t("resource.localization.delivery_not_match");
      }
    },
    [globalConfig]
  );

  return {
    isHyperlocal: !!globalConfig?.is_hyperlocal,
    convertUTCToHyperlocalTat,
  };
};
