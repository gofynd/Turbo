import { useCallback } from "react";
import { useFPI, useGlobalTranslation } from "fdk-core/utils";
import useInternational from "../../components/header/useInternational";
import { createFieldValidation } from "../utils";

export const usePincodeInput = () => {
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const { countryAddressFieldMap } = useInternational({
    fpi,
  });

  const pincodeField = countryAddressFieldMap?.pincode;

  const { display_name, required, validation } = pincodeField ?? {};
  const { type, regex } = validation || {};
  const { value, length } = regex || {};
  const { min, max } = length || {};

  const validatePincode = useCallback(createFieldValidation(pincodeField, t), [
    display_name,
    required,
    type,
    value,
    min,
    max,
  ]);

  return {
    displayName: display_name ?? "Pincode",
    maxLength: max ?? 11,
    validatePincode,
  };
};
