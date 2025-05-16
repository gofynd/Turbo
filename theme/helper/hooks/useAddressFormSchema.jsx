import { useState, useEffect, useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { FETCH_LOCALITIES } from "../../queries/internationlQuery";
import { LOCALITY } from "../../queries/logisticsQuery";
import {
  capitalize,
  createLocalitiesPayload,
} from "../utils";
import { useSnackbar } from "./hooks";

export const useAddressFormSchema = ({
  fpi,
  countryCode,
  countryIso,
  addressTemplate,
  addressFields,
  addressItem,
}) => {
  const { t } = useGlobalTranslation("translation");
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const [formFields, SetFormFields] = useState(null);
  const [dropdownData, setDropdownData] = useState(null);
  const [disableField, setDisableField] = useState(null);

  const { showSnackbar } = useSnackbar();

  function createValidation(field) {
    const { slug, display_name, required, validation } = field;
    const result = {};
    if (slug === "phone") {
      result.validate = (value) => {
        if (required && !value?.mobile?.trim()) {
          return `${display_name} ${t("resource.common.address.is_required")}`;
        }
        if (!value || !value.isValidNumber) {
          return t("resource.common.address.invalid_phone_number");
        }
        // if (validation?.regex?.value) {
        //   try {
        //     const regex = new RegExp(validation.regex.value);
        //     const isValid = regex.test(value.mobile);
        //     if (!isValid) {
        //       return error_text ?? "Invalid";
        //     }
        //   } catch (error) {}
        // }
        return true;
      };
      return result;
    }

    result.validate = (value) => {
      if (required && !value?.trim()) {
        return `${display_name} ${t("resource.common.address.is_required")}`;
      }

      if (
        (required || value) &&
        validation?.type === "regex" &&
        validation?.regex?.value
      ) {
        try {
          const regex = new RegExp(validation.regex.value);
          if (!regex.test(value)) {
            return `${t("resource.common.invalid")} ${display_name}`;
          }
        } catch (error) {
          return t("resource.common.invalid_regex");
        }
      }
      const { min, max } = validation?.regex?.length || {};
      if (
        (required || value) &&
        ((max && value.length > max) || (min && value.length < min))
      ) {
        return `${display_name} ${t("resource.common.validation_length", { min: min || 0, max: max || "∞" })}.`;
      }
      return true;
    };
    return result;
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
    (value, { setValue, getValues }) => {
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
      validation,
      error_text,
      next,
      prev,
      edit,
      values,
    } = field;

    const type =
      input === "textbox" ? (slug === "phone" ? "mobile" : "text") : input;
    const key = slug === "pincode" ? "area_code" : slug;

    const formField = {
      key,
      display,
      type,
      required,
      fullWidth: false,
      validation: createValidation(field),
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
      if (
        !prev ||
        !!addressItem?.[key] ||
        (locationDetails?.country_iso_code === countryIso &&
          locationDetails?.[slug])
      ) {
        getLocalityValues(
          slug,
          key,
          createLocalitiesPayload(
            prev,
            addressFieldsMap,
            !!addressItem?.[key]
              ? addressItem
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
    } catch (error) { }
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

        output[currentIndex]?.fields.push(convertField(obj));
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

    const schema = renderTemplate(addressTemplate);
    SetFormFields(schema);

    return () => {
      SetFormFields(null);
      setDropdownData(null);
      setDisableField(null);
    };
  }, [addressTemplate, addressFields]);

  const formSchema = useMemo(() => {
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
  }, [formFields, dropdownData, disableField]);

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
    defaultAddressItem: {
      ...defaultAddressItem,
      ...(isLoggedIn && { is_default_address: true }),
    },
  };
};
