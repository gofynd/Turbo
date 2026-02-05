import React, { useState, useEffect, Fragment, useMemo, Suspense } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useParams } from "react-router-dom";
import {
  useGlobalStore,
  useGlobalTranslation,
  useLocale,
} from "fdk-core/utils";
import "@gofynd/theme-template/components/core/modal/modal.css";
import FyInput from "@gofynd/theme-template/components/core/fy-input/fy-input";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import styles from "./styles/i18n-dropdown.less";
import FyDropdownLib from "../core/fy-dropdown/fy-dropdown-lib";
import useInternational from "./useInternational";
import { LOCALITY } from "../../queries/logisticsQuery";
import { useSyncedState, useSnackbar } from "../../helper/hooks";
import { LANGUAGES } from "../../queries/languageQuery";
import { createLocalitiesPayload } from "../../helper/utils";
import InternationalIcon from "../../assets/images/international.svg";
import ArrowDownIcon from "../../assets/images/arrow-down.svg";
import CrossIcon from "../../assets/images/cross-black.svg";
import TruckIcon from "../../assets/images/truck.svg";
import useHyperlocal from "./location-modal/useHyperlocal";

const Modal = React.lazy(
  () => import("@gofynd/theme-template/components/core/modal/modal")
);
const LocationModal = React.lazy(
  () => import("./location-modal/location-modal")
);
function I18Dropdown({ fpi, languageIscCode = [] }) {
  const { locale } = useParams();
  const { t } = useGlobalTranslation("translation");
  const {
    isInternational,
    i18nDetails,
    countryDetails,
    currentCountry,
    currentCurrency,
    countryCurrencies,
    fetchCountrieDetails,
    fetchLocalities,
    setI18nDetails,
  } = useInternational({
    fpi,
  });
  const { activeLocale, updateLocale } = useLocale();
  const i18N_DETAILS = useGlobalStore(fpi.getters.i18N_DETAILS);

  const { showSnackbar } = useSnackbar();
  const location = useLocation();
  const [countryInfo, setCountryInfo] = useSyncedState(countryDetails);
  const { isI18ModalOpen = false, showLanguageDropdown = false } =
    useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const CONFIGURATION = useGlobalStore(fpi?.getters?.CONFIGURATION);
  const globalData = useGlobalStore(fpi?.getters?.CUSTOM_VALUE)?.globalData;
  const sellerDetailsRaw = useGlobalStore(fpi?.getters?.SELLER_DETAILS);

  // Parse sellerDetails if it's a string
  const sellerDetails = useMemo(() => {
    if (!sellerDetailsRaw) return {};
    try {
      return typeof sellerDetailsRaw === "string"
        ? JSON.parse(sellerDetailsRaw || "{}")
        : sellerDetailsRaw;
    } catch {
      return {};
    }
  }, [sellerDetailsRaw]);

  // Check if seller country matches selected country
  // When international is enabled, show serviceability fields only if seller country matches
  const shouldShowServiceabilityFields = useMemo(() => {
    if (!isInternational) {
      // When international is disabled, always show serviceability fields
      return true;
    }

    // When international is enabled, check if seller country matches selected country
    const sellerCountryCode = sellerDetails?.country_code;
    const selectedCountryCode = countryInfo?.iso2 || i18nDetails?.countryCode;

    // Show serviceability fields if seller country matches selected country
    // This means user is selecting their own country, so serviceability check is needed
    if (
      sellerCountryCode &&
      selectedCountryCode &&
      String(sellerCountryCode).toUpperCase() ===
        String(selectedCountryCode).toUpperCase()
    ) {
      return true;
    }

    return false;
  }, [
    isInternational,
    sellerDetails?.country_code,
    countryInfo?.iso2,
    i18nDetails?.countryCode,
  ]);

  // Get countryCurrencies from multiple sources as fallback
  // 1. From customValues (set by globalDataResolver)
  // 2. From globalData directly (fallback if customValues not set yet)
  const countryCurrenciesWithFallback = useMemo(() => {
    if (countryCurrencies && countryCurrencies.length > 0) {
      return countryCurrencies;
    }
    // Fallback to globalData if countryCurrencies not in customValues yet
    const fromGlobalData =
      globalData?.applicationConfiguration?.country_currencies;
    if (fromGlobalData && fromGlobalData.length > 0) {
      return fromGlobalData;
    }
    return countryCurrencies; // Return undefined if neither available
  }, [countryCurrencies, globalData]);

  // Check features.international flag (not international_shipping.enabled)
  // This is the flag that should be false for our use case
  const isInternationalFeature = useMemo(() => {
    return CONFIGURATION?.app_features?.international ?? false;
  }, [CONFIGURATION]);

  // Check if price factory is enabled (countryCurrencies exists and has length > 0)
  const isPriceFactoryEnabled = useMemo(() => {
    return !!(
      countryCurrenciesWithFallback && countryCurrenciesWithFallback.length > 0
    );
  }, [countryCurrenciesWithFallback]);

  // Determine if we should show LocationModal instead of i18n modal
  // When price factory is enabled AND features.international is false, show LocationModal
  const shouldShowLocationModal = useMemo(() => {
    return !!(isPriceFactoryEnabled && !isInternationalFeature);
  }, [isPriceFactoryEnabled, isInternationalFeature]);

  // Use hyperlocal hook for location modal functionality
  const {
    isServiceabilityModalOpen,
    openServiceabilityModal,
    closeServiceabilityModal,
    handleLocationUpdate,
    deliveryAddress,
  } = useHyperlocal(fpi);

  const [formSchema, setFormSchema] = useState([]);
  const [formOptions, setFormOptions] = useState({});
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const { control, handleSubmit, setValue, reset, watch, getValues } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      country: currentCountry,
      currency: currentCurrency,
    },
  });

  useEffect(() => {
    setValue(
      "language",
      languageIscCode?.find((lang) => lang.locale === activeLocale) || {}
    );
  }, [languageIscCode]);

  const showI18Dropdown = useMemo(() => {
    const whiteListedRoutes = [
      "/product",
      "/products",
      "/collections",
      "/collection",
      "/categories",
      "/brands",
      "/profile/address",
    ];

    const currentPath = location.pathname;

    if (
      currentPath === "/" ||
      currentPath === `/${locale}/` ||
      currentPath === `/${locale}`
    ) {
      return true;
    }

    return whiteListedRoutes.some(
      (route) =>
        currentPath.startsWith(route) ||
        currentPath.startsWith(`/${locale}${route}`)
    );
  }, [location.pathname]);

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
    } catch (error) {
      // Error handled silently
    }
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
          showSnackbar(
            res?.errors?.[0]?.message || t("resource.common.error_message"),
            "error"
          );
          throw res;
        }
        return res.data.locality;
      });
  };

  const handleSetI18n = (formValues) => {
    const { currency, language } = formValues;
    updateLocale(language?.locale);

    fpi.setI18nDetails({
      ...i18N_DETAILS,
      language: {
        ...i18N_DETAILS?.language,
        locale: language?.locale,
      },
    });
    setI18nDetails(
      {
        iso: countryInfo.iso2,
        phoneCode: countryInfo.phone_code,
        name: countryInfo.display_name,
      },
      currency?.code ?? i18nDetails?.currency?.code
    );

    // When international is enabled, skip serviceability check only if seller country doesn't match
    // If seller country matches, perform serviceability check as usual
    if (isInternational && !shouldShowServiceabilityFields) {
      fpi.custom.setValue("isI18ModalOpen", false);
      fpi.custom.setValue("showLanguageDropdown", false);
      return;
    }

    // For non-international, check serviceability
    const field = countryInfo?.fields?.serviceability_fields.at(-1);
    const addressField = addressFieldsMap?.[field];
    if (addressField) {
      checkLocality(
        addressField.input === "list"
          ? formValues?.[field]?.display_name
          : formValues?.pincode,
        field,
        formValues
      ).then(() => {
        fpi.custom.setValue("isI18ModalOpen", false);
        fpi.custom.setValue("showLanguageDropdown", false);
      });
    }
  };

  const onDynamicFieldChange = async (selectedField) => {
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
    if (country?.currencies?.length) {
      const options = country.currencies.map((currency) => ({
        label: `${currency.name} (${currency.code}) ${currency.symbol}`,
        value: currency.code,
        code: currency.code,
        name: currency.name,
        isDefault: currency.is_default,
      }));
      setCurrencyOptions(options);
      const defaultCurrency =
        options.find((opt) => opt.isDefault) || options[0];
      setValue("currency", defaultCurrency);
    } else {
      setCurrencyOptions([]);
      setValue("currency", null);
    }

    try {
      const { data, errors } = await fetchCountrieDetails(
        { countryIsoCode: country?.iso2 },
        { skipStoreUpdate: true }
      );
      if (data?.country) {
        setCountryInfo(data.country);
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const openI18nModal = () => {
    // If price factory is enabled and international is false, open LocationModal instead
    if (shouldShowLocationModal) {
      openServiceabilityModal();
      return;
    }
    fpi.custom.setValue("isI18ModalOpen", true);
    fpi.custom.setValue("showLanguageDropdown", true);
  };

  const closeI18nModal = () => {
    fpi.custom.setValue("isI18ModalOpen", false);
    fpi.custom.setValue("showLanguageDropdown", false);
    setCountryInfo(countryDetails);
    reset({
      country: currentCountry,
      currency: currentCurrency,
      language:
        languageIscCode?.find(
          (localeObj) => localeObj.locale === activeLocale
        ) || {},
    });
  };

  function createValidation(validation, required, error_text, type, field) {
    const result = {};
    const errorText =
      field?.display_name?.toLowerCase() === "postcode" ||
      field?.display_name?.toLowerCase() === "postal code"
        ? `${t("resource.common.invalid")} ${field?.display_name}`
        : (error_text ?? t("resource.common.invalid"));

    if (type === "list") {
      result.validate = (value) =>
        Object.keys(value || {}).length > 0 || errorText;

      return result;
    }

    if (required) {
      result.required = errorText;
    }

    if (validation?.type === "regex") {
      result.pattern = {
        value: new RegExp(validation?.regex?.value),
        message: errorText,
      };

      if (validation?.regex?.length?.max) {
        result.maxLength = {
          value: validation?.regex?.length?.max,
          message: errorText,
        };
      }

      if (validation?.regex?.length?.min) {
        result.minLength = {
          value: validation?.regex?.length?.min,
          message: errorText,
        };
      }
    }

    return result;
  }

  // useEffect(() => {
  //   if (currentCountry && Object.keys(currentCountry).length > 0) {
  //     setValue("country", currentCountry);
  //     handleCountryChange(currentCountry);
  //   }
  // }, [currentCountry, setValue]);

  useEffect(() => {
    if (activeLocale && getValues("language")?.locale !== activeLocale) {
      setValue(
        "language",
        languageIscCode?.find(
          (localeObj) => localeObj.locale === activeLocale
        ) || {}
      );
    }
  }, [activeLocale, languageIscCode, setValue]);

  useEffect(() => {
    if (currentCurrency && Object.keys(currentCurrency).length > 0) {
      setValue("currency", currentCurrency);
    }
  }, [currentCurrency, setValue]);

  useEffect(() => {
    // Set serviceability fields based on shouldShowServiceabilityFields
    // When international is enabled, only show if seller country matches
    if (countryInfo && shouldShowServiceabilityFields) {
      const serviceabilityFields =
        countryInfo?.fields?.serviceability_fields || [];
      const dynamicFormSchema = serviceabilityFields.map((field) => {
        const addressField = addressFieldsMap[field];

        const fieldValidation = createValidation(
          addressField.validation,
          addressField.required,
          addressField.error_text,
          addressField.input,
          addressField
        );

        if (addressField.input === "list") {
          return {
            ...addressField,
            validation: fieldValidation,
          };
        }

        return { ...addressField, validation: fieldValidation };
      });
      setFormSchema(dynamicFormSchema);
      return () => {
        setFormOptions([]);
        serviceabilityFields?.forEach((field) => {
          setValue(field, "");
        });
      };
    } else {
      // Clear form schema when serviceability fields should not be shown
      setFormSchema([]);
    }
  }, [countryInfo, shouldShowServiceabilityFields]);

  useEffect(() => {
    // Populate serviceability fields only if they should be shown
    if (isI18ModalOpen && shouldShowServiceabilityFields) {
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
    }
  }, [formSchema, isI18ModalOpen, shouldShowServiceabilityFields]);

  // Ensure shouldShowLocationModal is always a boolean
  const finalShouldShowLocationModal = shouldShowLocationModal ?? false;

  return (
    <div className={`${styles.internationalization}`}>
      {(languageIscCode.length > 1 ||
        (isInternational && showI18Dropdown) ||
        finalShouldShowLocationModal) && (
        <button
          className={styles.internationalization__selected}
          onClick={openI18nModal}
        >
          {finalShouldShowLocationModal ? (
            <>
              <TruckIcon className={styles.truckIcon} />
              <span className={styles.locationLabel}>
                {deliveryAddress || t("resource.header.location_label")}
              </span>
              <ArrowDownIcon className={styles.angleDownIcon} />
            </>
          ) : (
            <>
              <InternationalIcon className={styles.internationalIcon} />
              {currentCountry?.name && currentCurrency?.code ? (
                <>
                  <span
                    className={`${styles.locationLabel} ${styles.locationLabelMobile}`}
                  >
                    {t("resource.common.deliver_to")}{" "}
                  </span>
                  <span
                    className={`${styles.locationLabel} ${styles.languageDisplayContainer}`}
                  >{`${currentCountry.name ?? " "} - ${currentCurrency.code}`}</span>
                </>
              ) : (
                languageIscCode.length > 1 && (
                  <span className={styles.languageDisplayContainer}>
                    {languageIscCode?.find(
                      (localeObj) => localeObj.locale === activeLocale
                    )?.display_name || ""}
                  </span>
                )
              )}
              {showI18Dropdown && (
                <ArrowDownIcon className={styles.angleDownIcon} />
              )}
            </>
          )}
        </button>
      )}
      {finalShouldShowLocationModal && isServiceabilityModalOpen && (
        <Suspense fallback={<div />}>
          <LocationModal
            fpi={fpi}
            isOpen={isServiceabilityModalOpen}
            onClose={closeServiceabilityModal}
            onConfirm={handleLocationUpdate}
          />
        </Suspense>
      )}
      {isI18ModalOpen && (
        <Suspense fallback={<div />}>
          <Modal
            hideHeader={true}
            isOpen={isI18ModalOpen}
            closeDialog={closeI18nModal}
            bodyClassName={styles.i18ModalBody}
            containerClassName={styles.i18ModalContainer}
            ignoreClickOutsideForClass="fydrop"
          >
            <h4 className={styles.title}>
              {isInternational && showI18Dropdown
                ? t("resource.localization.choose_location")
                : languageIscCode.length > 1 &&
                  t("resource.localization.select_language")}{" "}
              <span onClick={closeI18nModal}>
                <CrossIcon />
              </span>
            </h4>
            <p className={styles.description}>
              {isInternational &&
                showI18Dropdown &&
                t("resource.localization.choose_address_for_availability")}
            </p>

            <form
              className={styles.internationalization__dropdown}
              onSubmit={handleSubmit(handleSetI18n)}
            >
              {isInternational && (
                <div className={`${styles.section}`}>
                  <FormField
                    formData={{
                      key: "country",
                      type: "list",
                      label: t("resource.localization.select_country"),
                      placeholder: t("resource.localization.select_country"),
                      options:
                        countryCurrenciesWithFallback ||
                        countryCurrencies ||
                        [],
                      dataKey: "uid",
                      onChange: handleCountryChange,
                      validation: {
                        validate: (value) =>
                          Object.keys(value || {}).length > 0 ||
                          t("resource.localization.invalid_country"),
                      },
                      getOptionLabel: (option) => option.name || "",
                    }}
                    control={control}
                  />
                </div>
              )}

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

              {isInternational && (
                <div className={`${styles.section}`}>
                  <FormField
                    formData={{
                      key: "currency",
                      type: "list",
                      label: t("resource.localization.select_currency"),
                      placeholder: t("resource.localization.select_currency"),
                      options: currencyOptions,
                      dataKey: "code",
                      validation: {
                        validate: (value) =>
                          Object.keys(value || {}).length > 0 ||
                          t("resource.localization.invalid_currency"),
                      },
                      getOptionLabel: (option) => {
                        return option?.code
                          ? `${option?.code} - ${option?.name}`
                          : "";
                      },
                    }}
                    control={control}
                  />
                </div>
              )}
              {showLanguageDropdown && languageIscCode.length > 1 && (
                <div className={`${styles.section}`}>
                  <FormField
                    formData={{
                      key: "language",
                      type: "list",
                      label: t("resource.localization.select_language"),
                      placeholder: t("resource.localization.select_language"),
                      options: languageIscCode,
                      dataKey: "locale",
                      validation: {
                        required: t("resource.header.language_is_required"), // Ensure language selection is required
                        validate: (value) =>
                          value?.locale
                            ? true
                            : t("resource.header.language_is_required"),
                      },
                      getOptionLabel: (option) => {
                        return option.display_name || "";
                      },
                    }}
                    control={control}
                  />
                </div>
              )}
              <button className={`${styles.save_btn}`} type="submit">
                {t("resource.facets.apply")}
              </button>
            </form>
          </Modal>
        </Suspense>
      )}
    </div>
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

export default I18Dropdown;
