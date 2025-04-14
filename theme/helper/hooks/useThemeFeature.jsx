import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "./useThemeConfig";

export const useThemeFeature = ({ fpi }) => {
  const { globalConfig } = useThemeConfig({ fpi });
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);

  const isInternational =
    CONFIGURATION?.app_features?.common?.international_shipping?.enabled ??
    false;

  const { is_hyperlocal: isHyperlocal } = globalConfig;

  return {
    isInternational,
    isHyperlocal,
  };
};
