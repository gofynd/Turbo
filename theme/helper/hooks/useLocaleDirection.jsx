import { useMemo } from "react";
import { useFPI } from "fdk-core/utils";
import { getLocaleDirection } from "../utils";

const useLocaleDirection = () => {
  const fpi = useFPI();
  const direction = useMemo(() => getLocaleDirection(fpi), [fpi]);
  const isRTL = direction === "rtl";

  return { isRTL, direction };
};

export default useLocaleDirection;
