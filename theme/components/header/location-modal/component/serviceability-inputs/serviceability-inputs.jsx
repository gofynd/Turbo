import React, { useState, useEffect, Fragment, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import FyInput from "@gofynd/theme-template/components/core/fy-input/fy-input";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import styles from "./serviceability-inputs.less";
import FyDropdownLib from "../../../../core/fy-dropdown/fy-dropdown-lib";
import useInternational from "../../../useInternational";
import { LOCALITY } from "../../../../../queries/logisticsQuery";
import { useSyncedState } from "../../../../../helper/hooks";
import {
  createLocalitiesPayload,
  createFieldValidation,
} from "../../../../../helper/utils";

function ServiceabilityInputs({ fpi, className = "", onSubmit = () => {} }) {
  const {
    isInternational,
    i18nDetails,
    countries,
    countryDetails,
    currentCountry,
    fetchCountrieDetails,
    fetchLocalities,
    setI18nDetails,
  } = useInternational({
    fpi,
  });
  const { t } = useGlobalTranslation("translation");
  const [countryInfo, setCountryInfo] = useSyncedState(countryDetails);
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);

  const [formSchema, setFormSchema] = useState([]);
  const [formOptions, setFormOptions] = useState({});
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    getValues,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      country: currentCountry ?? countryInfo?.iso2,
    },
  });

  const addressFieldsMap = useMemo(() => {
    if (!countryInfo?.fields?.address) return {};
    const prevFieldMap = countryInfo.fields.address.reduce((acc, field) => {
      if (field.next) {
        acc[field.next] = field.slug;
      }
      return acc;
    }, {});
    return countryInfo.fields.address.reduce((acc, field) => {
      acc[field.slug] = prevFieldMap[field.slug]
        ? { ...field, prev: prevFieldMap[field.slug] }
        : field;
      return acc;
    }, {});
  }, [countryInfo]);

  const getLocalityValues = async (slug, restFields = {}) => {
    const payload = {
      pageNo: 1,
      pageSize: 1000,
      country: countryInfo?.iso2,
      locality: slug,
      ...restFields,
    };
    try {
      const localities = await fetchLocalities(payload);
      if (localities) {
        setFormOptions((prev) => ({
          ...prev,
          [slug]: localities,
        }));
      }
    } catch (error) {}
  };

  const checkLocality = (localityValue, localityType, selectedValues) => {
    return fpi
      .executeGQL(LOCALITY, {
        locality: localityType,
        localityValue,
        city: selectedValues?.city?.name,
        country: countryInfo.iso2,
        state: "",
      })
      .then((res) => {
        if (!res?.data?.locality) {
          throw res;
        }
        return res.data.locality;
      });
  };

  const handleSetI18n = (formValues) => {
    if (i18nDetails?.countryCode !== countryInfo.iso2) {
      setI18nDetails(
        {
          iso: countryInfo.iso2,
          phoneCode: countryInfo.phone_code,
          name: countryInfo.display_name,
        },
        i18nDetails?.currency?.code
      );
    }
    const field = countryInfo?.fields?.serviceability_fields.at(-1);
    const addressField = addressFieldsMap?.[field];
    if (addressField) {
      checkLocality(
        addressField.input === "list"
          ? formValues?.[field]?.display_name
          : formValues?.pincode,
        field,
        formValues
      )
        .then(() => {
          const formattedFormvalues = Object.entries(formValues).reduce(
            (acc, [key, value]) => {
              const tempKey = key === "pincode" ? "area_code" : key;
              return {
                ...acc,
                [tempKey]: value?.display_name ?? value,
              };
            },
            {}
          );
          onSubmit(formattedFormvalues);
        })
        .catch(({ errors }) => {
          setError("root", {
            message: errors?.[0]?.message || t("resource.common.error_message"),
          });
        });
    }
  };

  const onDynamicFieldChange = async (selectedField) => {
    clearErrors();
    const serviceabilitySlugs =
      countryInfo?.fields?.serviceability_fields || [];
    const currentIndex = serviceabilitySlugs?.findIndex(
      (slug) => slug === selectedField.slug
    );

    const updatedFormSchema = [...formSchema];

    const nextIndex =
      currentIndex + 1 < serviceabilitySlugs.length ? currentIndex + 1 : -1;

    if (nextIndex !== -1) {
      const nextSlug = serviceabilitySlugs[nextIndex];
      updatedFormSchema.slice(nextIndex).forEach((field) => {
        setValue(field.slug, "");
      });
      getLocalityValues(
        nextSlug,
        createLocalitiesPayload(
          selectedField.slug,
          addressFieldsMap,
          getValues()
        )
      );
    }
  };

  const handleCountryChange = async (country) => {
    if (country?.meta?.country_code === countryInfo?.iso2) return;

    try {
      const response = await fetchCountrieDetails(
        { countryIsoCode: country?.meta?.country_code },
        { skipStoreUpdate: true }
      );
      if (response?.data?.country) {
        const countryInfo = response.data.country;
        setCountryInfo(countryInfo);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (currentCountry && Object.keys(currentCountry).length > 0) {
      setValue("country", currentCountry);
    }
  }, [currentCountry, setValue]);

  useEffect(() => {
    if (countryInfo) {
      const serviceabilityFields =
        countryInfo?.fields?.serviceability_fields || [];
      const dynamicFormSchema = serviceabilityFields.map((field) => {
        const addressField = addressFieldsMap[field];

        const fieldValidation = createFieldValidation(addressField, t);

        if (addressField.input === "list") {
          return {
            ...addressField,
            validation: { validate: fieldValidation },
          };
        }

        return { ...addressField, validation: { validate: fieldValidation } };
      });
      setFormSchema(dynamicFormSchema);
      return () => {
        setFormOptions([]);
        serviceabilityFields?.forEach((field) => {
          setValue(field, "");
        });
      };
    }
  }, [countryInfo]);

  useEffect(() => {
    formSchema.forEach((field) => {
      const { slug, input, prev } = field;
      const fieldValue =
        locationDetails?.country_iso_code === countryInfo?.iso2
          ? locationDetails?.[slug] || null
          : null;

      if (fieldValue) {
        setValue(
          slug,
          input === "list" ? { display_name: fieldValue } : fieldValue
        );
      }

      if (input === "list" && (fieldValue || !prev)) {
        getLocalityValues(
          slug,
          createLocalitiesPayload(
            prev,
            addressFieldsMap,
            locationDetails?.country_iso_code === countryInfo?.iso2
              ? locationDetails
              : {}
          )
        );
      }
    });
  }, [formSchema]);

  return (
    <form
      className={`${styles.internationalization__dropdown} ${className}`}
      onSubmit={handleSubmit(handleSetI18n)}
    >
      {/* {isInternational && (
        <div className={`${styles.section}`}>
          <FormField
            formData={{
              key: "country",
              type: "list",
              label: "Select country",
              placeholder: "Select country",
              options: countries,
              dataKey: "uid",
              onChange: handleCountryChange,
              validation: {
                validate: (value) =>
                  Object.keys(value || {}).length > 0 || `Invalid country`,
              },
              getOptionLabel: (option) => option.display_name || "",
            }}
            control={control}
          />
        </div>
      )} */}
      {formSchema.map((field) => (
        <Fragment key={field.slug}>
          {field?.input ? (
            <div className={`${styles.section}`}>
              <FormField
                formData={{
                  key: field.slug,
                  type: field?.input,
                  label: field?.display_name,
                  placeholder: field?.display_name,
                  options: formOptions[field.slug] ?? [],
                  disabled: field.prev ? !watch(field.prev) : false,
                  onChange: (value) => {
                    onDynamicFieldChange(field, value);
                  },
                  validation: field.validation,
                  getOptionLabel: (option) => option.display_name || "",
                }}
                control={control}
              />
            </div>
          ) : null}
        </Fragment>
      ))}
      <button className={`${styles.save_btn}`} type="submit">
        Apply
      </button>
      {errors.root && <p className={styles.errorText}>{errors.root.message}</p>}
    </form>
  );
}

const FormField = ({ formData, control }) => {
  const {
    label = "",
    placeholder = "",
    options = [],
    key = "",
    type = "",
    onChange = (value) => {},
    validation = {},
    getOptionLabel,
    disabled = false,
    dataKey,
  } = formData;

  const InputComponent = ({ field, error }) => {
    if (type === "list") {
      return (
        <FyDropdownLib
          label={label}
          placeholder={placeholder}
          value={field.value}
          options={options}
          labelClassName={styles.autoCompleteLabel}
          containerClassName={styles.autoCompleteContainer}
          disabled={disabled}
          onChange={(value) => {
            field.onChange(value);
            onChange(value);
          }}
          error={error}
          dataKey={dataKey}
          getOptionLabel={getOptionLabel}
        />
      );
    }

    return (
      <FyInput
        name={field?.name}
        label={label}
        labelVariant="floating"
        labelClassName={styles.inputLabel}
        inputClassName={styles.inputField}
        inputVariant="outlined"
        value={field.value}
        disabled={disabled}
        onChange={(e) => {
          field.onChange(e.target.value);
          onChange(e.target.value);
        }}
        error={!!error?.message}
        errorMessage={error?.message}
      />
    );
  };

  return (
    <Controller
      name={key}
      control={control}
      rules={validation}
      render={({ field, fieldState: { error } }) =>
        InputComponent({ field, error })
      }
    />
  );
};

export default ServiceabilityInputs;
