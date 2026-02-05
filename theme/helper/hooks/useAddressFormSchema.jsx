import { useState, useEffect, useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { FETCH_LOCALITIES } from "../../queries/internationlQuery";
import { LOCALITY } from "../../queries/logisticsQuery";
import {
  capitalize,
  createLocalitiesPayload,
  translateDynamicLabel,
  createFieldValidation,
} from "../utils";
import { useSnackbar } from "./hooks";
import { useThemeFeature } from "./useThemeFeature";
import { useGoogleMapConfig } from "./useGoogleMapConfig";

export const useAddressFormSchema = ({
  fpi,
  countryCode,
  countryIso,
  addressTemplate,
  addressFields,
  addressItem,
}) => {
  const { t } = useGlobalTranslation("translation");
  const { selectedAddress } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const [formFields, SetFormFields] = useState(null);
  const [dropdownData, setDropdownData] = useState(null);
  const [disableField, setDisableField] = useState(null);

  const { showSnackbar } = useSnackbar();
  const { isServiceability } = useThemeFeature({ fpi });
  const { isCheckoutMap } = useGoogleMapConfig({ fpi });

  function isFieldAvailable({ key }) {
    const tempAddressItem = !selectedAddress?.id
      ? (selectedAddress ?? defaultAddressItem)
      : defaultAddressItem;
    return !!tempAddressItem?.[key];
  }

  const resetNextFieldRecursively = (slug, setValue) => {
    const field = addressFieldsMap?.[slug];
    if (!field) return;
    if (field.next) {
      resetNextFieldRecursively(field.next, setValue);
    }
    const key = slug === "pincode" ? "area_code" : slug;
    setValue(key, "");
  };

  const handleFieldChange =
    ({ next, slug }) =>
    (_, { setValue, getValues }) => {
      if (!next) return;
      const key = next === "pincode" ? "area_code" : next;
      resetNextFieldRecursively(next, setValue);
      getLocalityValues(
        next,
        key,
        createLocalitiesPayload(slug, addressFieldsMap, getValues())
      );
      setDisableField((prev) => ({ ...prev, [key]: false }));
    };

  const getLocality = (posttype, postcode) => {
    return fpi
      .executeGQL(
        LOCALITY,
        {
          locality: posttype,
          localityValue: `${postcode}`,
          country: countryIso,
        },
        { skipStoreUpdate: true }
      )
      .then((res) => {
        const data = { showError: false, errorMsg: "" };
        const localityObj = res?.data?.locality || false;
        if (localityObj) {
          if (posttype === "pincode") {
            localityObj?.localities.forEach((locality) => {
              switch (locality.type) {
                case "city":
                  data.city = capitalize(locality.display_name);
                  break;
                case "state":
                  data.state = capitalize(locality.display_name);
                  break;
                case "country":
                  data.country = capitalize(locality.display_name);
                  break;
                default:
                  break;
              }
            });
          }

          return data;
        } else {
          showSnackbar(
            res?.errors?.[0]?.message || "Pincode verification failed",
            "error"
          );
          data.showError = true;
          data.errorMsg =
            res?.errors?.[0]?.message || "Pincode verification failed";
          return data;
        }
      });
  };

  const handlePinChange = async (value, { setValue, setError, trigger }) => {
    const isPinValid = await trigger("area_code");

    if (!isPinValid) {
      return;
    }

    const validatePin = async () => {
      getLocality("pincode", value).then((data) => {
        setValue("city", "");
        setValue("state", "");
        if (data?.showError) {
          setError("area_code", {
            type: "manual",
            message: data?.errorMsg,
          });
        } else {
          const { city = "", state = "" } = data;
          setValue("city", city);
          setValue("state", state);
        }
      });
    };

    validatePin();
  };

  function convertField(field) {
    const {
      input,
      slug,
      display_name: display,
      required,
      next,
      prev,
      edit,
      values,
    } = field;

    if (
      isServiceability &&
      isCheckoutMap &&
      countryIso === "IN" &&
      ["pincode", "state", "city"].includes(slug)
    ) {
      return;
    }

    const type =
      input === "textbox" ? (slug === "phone" ? "mobile" : "text") : input;
    const key = slug === "pincode" ? "area_code" : slug;

    const formField = {
      key,
      display,
      type,
      required,
      fullWidth: false,
      validation: { validate: createFieldValidation(field, t) },
      disabled: addressItem?.[key]
        ? !addressItem[key]
        : locationDetails?.country_iso_code === countryIso &&
            locationDetails?.[slug]
          ? !locationDetails?.[slug]
          : !!prev,
      readOnly: !edit,
    };
    if (slug === "pincode" && values?.get_one?.operation_id === "getLocality") {
      formField.onChange = handlePinChange;
    }
    if (slug === "phone") {
      formField.countryCode = countryCode?.replace("+", "");
      // formField.countryIso = countryIso?.toLowerCase();
    }
    if (type === "list") {
      if (!prev || !!addressItem?.[key] || isFieldAvailable({ key })) {
        getLocalityValues(
          slug,
          key,
          createLocalitiesPayload(
            prev,
            addressFieldsMap,
            !!addressItem?.[key]
              ? addressItem
              : !selectedAddress?.id
                ? selectedAddress
                : locationDetails?.country_iso_code === countryIso
                  ? locationDetails
                  : {}
          )
        );
      }
      formField.onChange = handleFieldChange({ next, slug });
    }
    return formField;
  }

  const convertDropdownOptions = (items) => {
    return items.map(({ display_name }) => ({
      key: display_name,
      display: display_name,
    }));
  };

  const getLocalityValues = async (slug, key, restFields = {}) => {
    const payload = {
      pageNo: 1,
      pageSize: 1000,
      country: countryIso,
      locality: slug,
      ...restFields,
    };
    try {
      fpi.executeGQL(FETCH_LOCALITIES, payload).then((res) => {
        if (res?.data?.localities) {
          const dropdownOptions = convertDropdownOptions(
            res?.data?.localities.items
          );
          setDropdownData((prev) => {
            return { ...prev, [key]: dropdownOptions };
          });
        }
      });
    } catch (error) {}
  };

  const renderTemplate = (template) => {
    let currentIndex = 0;
    const output = [
      {
        group: `addressInfo${currentIndex}`,
        groupLabel: `addressInfo${currentIndex}`,
        fields: [],
      },
    ];
    for (let i = 0; i < template?.length; i++) {
      const char = template[i];
      if (char === "{") {
        let braceCounter = 1;
        let closingIndex;
        for (let j = i + 1; j < template.length; j++) {
          if (template[j] === "{") braceCounter++;
          else if (template[j] === "}") braceCounter--;
          if (braceCounter === 0) {
            closingIndex = j;
            break;
          }
        }
        const key = template.slice(i + 1, closingIndex);
        const obj = addressFieldsMap[key];
        const convertedField = convertField(obj);
        if (convertedField) {
          output[currentIndex]?.fields.push(convertedField);
        }
        i = closingIndex;
      } else if (char === "_") {
        currentIndex++;
        output[currentIndex] = {
          group: `addressInfo${currentIndex}`,
          groupLabel: `addressInfo${currentIndex}`,
          fields: [],
        };
      }
    }
    return output;
  };

  const addressFieldsMap = useMemo(() => {
    if (!addressFields) return {};
    const prevFieldMap = addressFields.reduce((acc, field) => {
      if (field.next) {
        acc[field.next] = field.slug;
      }
      return acc;
    }, {});
    return addressFields.reduce((acc, field) => {
      acc[field.slug] = prevFieldMap[field.slug]
        ? { ...field, prev: prevFieldMap[field.slug] }
        : field;
      return acc;
    }, {});
  }, [addressFields]);

  useEffect(() => {
    if (!addressTemplate || !addressFields) return;

    // Reset dropdown data and disable field state when country/template changes
    // This ensures we don't use stale data from previous country
    setDropdownData(null);
    setDisableField(null);

    const schema = renderTemplate(addressTemplate);
    SetFormFields(schema);

    return () => {
      SetFormFields(null);
      setDropdownData(null);
      setDisableField(null);
    };
  }, [addressTemplate, addressFields, countryIso]); // Add countryIso as dependency

  const formSchema = useMemo(() => {
    // If formFields is null/undefined, return empty array for backward compatibility
    // This ensures formSchema is always an array and doesn't break components expecting an array
    if (!formFields) return [];
    
    // If dropdownData is not yet loaded, return formFields without dropdown options
    // This allows the form to render immediately with basic fields
    if (!dropdownData) return formFields;

    return formFields?.map((group) => ({
      ...group,
      fields: group.fields.map((field) => {
        const updatedField = {
          ...field,
          disabled: disableField?.[field.key] ?? field.disabled,
        };
        if (dropdownData[field.key]) {
          updatedField.enum = dropdownData[field.key];
        }
        return updatedField;
      }),
    }));
  }, [formFields, dropdownData, disableField, countryIso]); // Add countryIso to ensure schema updates when country changes

  const defaultAddressItem = useMemo(() => {
    const addressfields = Object.keys(addressFieldsMap);
    return addressfields.reduce((acc, field) => {
      if (
        locationDetails?.country_iso_code === countryIso &&
        locationDetails?.[field]
      ) {
        const key = field === "pincode" ? "area_code" : field;
        acc[key] = locationDetails[field];
      }
      return acc;
    }, {});
  }, [locationDetails, addressFieldsMap]);

  return {
    formSchema,
    defaultAddressItem:
      selectedAddress && !selectedAddress.id
        ? {
            ...defaultAddressItem,
            ...selectedAddress,
            ...(isLoggedIn && { is_default_address: true }),
          }
        : null,
  };
};
