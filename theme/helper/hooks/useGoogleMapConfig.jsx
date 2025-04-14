import { useThemeConfig } from "./useThemeConfig";

export const useGoogleMapConfig = ({ fpi }) => {
  const { globalConfig } = useThemeConfig({ fpi });

  return {
    isGoogleMap: !!globalConfig?.is_google_map && !!globalConfig?.map_api_key,
    mapApiKey: globalConfig?.map_api_key || "",
  };
};
