import { useThemeConfig } from "./useThemeConfig";

export const useGoogleMapConfig = ({ fpi }) => {
  const { globalConfig } = useThemeConfig({ fpi });

  return {
    isGoogleMap: !!globalConfig?.is_checkout_map && !!globalConfig?.map_api_key,
    isHeaderMap: !!globalConfig?.is_header_map && !!globalConfig?.map_api_key,
    isCheckoutMap:
      !!globalConfig?.is_checkout_map && !!globalConfig?.map_api_key,
    mapApiKey: globalConfig?.map_api_key || "",
  };
};
