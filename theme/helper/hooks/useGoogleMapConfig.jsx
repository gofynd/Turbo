import { useState } from "react";
import { useThemeConfig } from "./useThemeConfig";

export const useGoogleMapConfig = ({ fpi }) => {
  const { globalConfig } = useThemeConfig({ fpi });

  const [mapApiKey] = useState(globalConfig?.map_api_key || "");

  return {
    isGoogleMap: !!globalConfig?.is_checkout_map && !!globalConfig?.map_api_key,
    isHeaderMap: !!globalConfig?.is_header_map && !!globalConfig?.map_api_key,
    isCheckoutMap:
      !!globalConfig?.is_checkout_map && !!globalConfig?.map_api_key,
    mapApiKey: mapApiKey,
  };
};
