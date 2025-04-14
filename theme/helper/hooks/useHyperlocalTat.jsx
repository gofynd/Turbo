import { useCallback } from "react";
import { useThemeConfig } from "./useThemeConfig";

export const useHyperlocalTat = ({ fpi }) => {
  const { globalConfig } = useThemeConfig({ fpi });

  const convertUTCToHyperlocalTat = useCallback(
    (timestamp) => {
      if (!timestamp) {
        return "Please provide a valid time.";
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
        return "Please select at least one delivery option";
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
        return `Delivery in ${diffInMins} Minutes`;
      } else if (
        diffInMins > maxDeliveryMinutes &&
        diffInHours <= maxDeliveryHours &&
        is_delivery_hours
      ) {
        return `Delivery in ${diffInHours} Hours`;
      } else if (deliveryTime <= today && is_delivery_day) {
        return `Delivery by Today`;
      } else if (
        deliveryTime > today &&
        deliveryTime <= tomorrow &&
        is_delivery_day
      ) {
        return `Delivery by Tomorrow`;
      } else if (is_delivery_date) {
        return `Delivery by ${deliveryTime.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`;
      } else {
        return "Delivery option didn't match";
      }
    },
    [globalConfig]
  );

  return {
    isHyperlocal: !!globalConfig?.is_hyperlocal,
    convertUTCToHyperlocalTat,
  };
};
