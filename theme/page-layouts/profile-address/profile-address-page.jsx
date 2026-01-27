import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { LOCALITY } from "../../queries/logisticsQuery";
import useAddress from "../address/useAddress";
import Loader from "@gofynd/theme-template/components/loader/loader";
import "@gofynd/theme-template/components/loader/loader.css";
import { useSnackbar, useAddressFormSchema } from "../../helper/hooks";
import { capitalize, resetScrollPosition } from "../../helper/utils";
import styles from "./profile-address-page.less";
import AddressForm from "@gofynd/theme-template/components/address-form/address-form";
import "@gofynd/theme-template/components/address-form/address-form.css";
import useInternational from "../../components/header/useInternational";
import {
  useNavigate,
  useGlobalTranslation,
  useGlobalStore,
} from "fdk-core/utils";
import ProfileEmptyState from "@gofynd/theme-template/pages/profile/components/empty-state/empty-state";
import "@gofynd/theme-template/pages/profile/components/empty-state/empty-state.css";
import PlusAddressIcon from "../../assets/images/plus-address.svg";
import AddAddressIcon from "../../assets/images/add-address.svg";
import ProfileAddressCard from "../../components/profile-address-card/profile-address-card";

const DefaultAddress = () => {
  const { t } = useGlobalTranslation("translation");
  return (
    <span className={styles.defaultAdd}>{t("resource.common.default")}</span>
  );
};

const ProfileAddressPage = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location?.search);
  const allAddresses = useGlobalStore(fpi.getters.ADDRESS)?.address || [];
  const {
    isInternational,
    countries,
    currentCountry,
    countryCurrencies,
    countryDetails,
    fetchCountrieDetails,
    setI18nDetails,
  } = useInternational({
    fpi,
  });

  const {
    mapApiKey,
    fetchAddresses,
    addAddress,
    updateAddress,
    removeAddress,
  } = useAddress(fpi, "cart");

  const { showSnackbar } = useSnackbar();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressLoader, setAddressLoader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [countrySearchText, setCountrySearchText] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(currentCountry);
  const queryAddressId = searchParams.get("address_id");
  const userDetails = useGlobalStore(fpi.getters.USER_DATA);
  
  // Conditionally exclude phone from user data when international shipping is enabled
  const userDataForForm = useMemo(() => {
    if (isInternational && userDetails?.phone_numbers) {
      const { phone_numbers, ...rest } = userDetails;
      return rest;
    }
    return userDetails;
  }, [userDetails, isInternational]);
  
  // Track if we're in the middle of a user-initiated country change
  const isUserChangingCountry = useRef(false);
  const timeoutRef = useRef(null);
  
  const memoizedSelectedAdd = useMemo(() => {
    if (!queryAddressId) return;

    const selectedAdd = allAddresses?.find((add) => add.id === queryAddressId);
    if (!selectedAdd) return;

    return {
      ...selectedAdd,
      phone: {
        mobile: selectedAdd?.phone,
        countryCode: selectedAdd?.country_code?.replace("+", ""),
        isValidNumber: true,
      },
    };
  }, [allAddresses, queryAddressId]);

  useEffect(() => {
    // Only sync selectedCountry with currentCountry if:
    // 1. User is not actively changing the country
    // 2. AND we're not in create/edit mode (form is not open)
    // This prevents the reset loop when user changes country in address form
    if (
      currentCountry &&
      !isUserChangingCountry.current &&
      !isCreateMode &&
      !isEditMode
    ) {
      setSelectedCountry(currentCountry);
    } else if (
      currentCountry &&
      !isUserChangingCountry.current &&
      (isCreateMode || isEditMode) &&
      !selectedCountry
    ) {
      // Only sync on initial form open if selectedCountry is not set
      setSelectedCountry(currentCountry);
    }
  }, [currentCountry, isCreateMode, isEditMode, selectedCountry]);

  const { formSchema, defaultAddressItem } = useAddressFormSchema({
    fpi,
    countryCode:
      memoizedSelectedAdd?.country_phone_code ?? countryDetails?.phone_code,
    countryIso: memoizedSelectedAdd?.country_iso_code ?? countryDetails?.iso2,
    addressTemplate: countryDetails?.fields?.address_template?.checkout_form,
    addressFields: countryDetails?.fields?.address,
    addressItem: memoizedSelectedAdd,
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchAddresses().finally(() => setIsLoading(false));
  }, []);

  useLayoutEffect(() => {
    setSelectedAddress(null);
    const queryEdit = searchParams.get("edit");
    const queryAddressId = searchParams.get("address_id");
    if (queryEdit) {
      if (queryAddressId) {
        setIsCreateMode(false);
        setIsEditMode(true);
      } else {
        setIsCreateMode(true);
        setIsEditMode(false);
      }
    } else {
      setIsEditMode(false);
      setIsCreateMode(false);
    }
  }, [searchParams, allAddresses]);

  const navigateToLocation = (replace = true) => {
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace,
    });
  };

  const resetPage = () => {
    searchParams.delete("edit");
    searchParams.delete("address_id");
    navigateToLocation();
    // Clear any pending timeout when resetting
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isUserChangingCountry.current = false;
  };
  const onCreateClick = () => {
    setIsCreateMode(true);
    searchParams.set("edit", true);
    navigateToLocation(false);
  };
  const onEditClick = (addressId) => {
    const addressItem = allAddresses?.find(
      (address) => address?.id === addressId
    );
    setI18nDetails({
      iso: addressItem.country_iso_code,
      phoneCode: addressItem.country_code,
      name: addressItem.country,
    });
    navigate(location.pathname + `?edit=true&address_id=${addressId}`);
    resetScrollPosition();
  };
  const onCancelClick = () => {
    resetPage();
  };

  const addAddressHandler = (obj) => {
    if (
      obj?.geo_location?.latitude === "" &&
      obj?.geo_location?.longitude === ""
    ) {
      delete obj.geo_location;
    }
    for (const key in obj) {
      if (obj[key] === undefined) {
        delete obj[key]; // Removes undefined values directly from the original object
      }
    }
    // Convert country object to string (uid/id/iso2) if it's an object
    // Handles: API country objects (with id), countryCurrencies objects (with uid/iso2), and string values
    if (obj.country && typeof obj.country === "object" && obj.country !== null) {
      obj.country = obj.country.uid || obj.country.id || obj.country.iso2 || String(obj.country);
    }
    obj.country_phone_code = `+${obj.phone.countryCode}`;
    obj.phone = obj.phone.mobile;
    setAddressLoader(true);
    addAddress(obj).then(async (res) => {
      if (res?.data?.addAddress?.success) {
        showSnackbar(
          t("resource.common.address.address_addition_success"),
          "success"
        );
        await fetchAddresses().then(() => {
          resetPage();
          setAddressLoader(false);
        });
      } else {
        showSnackbar(
          res?.errors?.[0]?.message ??
            t("resource.common.address.new_address_creation_failure"),
          "error"
        );
      }
      window.scrollTo({
        top: 0,
      });
    });
  };

  const updateAddressHandler = (obj) => {
    // Convert country object to string (uid/id/iso2) if it's an object
    // Handles: API country objects (with id), countryCurrencies objects (with uid/iso2), and string values
    if (obj.country && typeof obj.country === "object" && obj.country !== null) {
      obj.country = obj.country.uid || obj.country.id || obj.country.iso2 || String(obj.country);
    }
    obj.country_phone_code = `+${obj.phone.countryCode}`;
    obj.phone = obj.phone.mobile;
    setAddressLoader(true);
    updateAddress(obj, memoizedSelectedAdd?.id).then(async (res) => {
      if (res?.data?.updateAddress?.success) {
        showSnackbar(
          t("resource.common.address.address_update_success"),
          "success"
        );
        await fetchAddresses().then(() => {
          resetPage();
          setAddressLoader(false);
        });
      } else {
        showSnackbar(
          res?.errors?.[0]?.message ??
            t("resource.common.address.address_update_failure"),
          "error"
        );
      }
      window.scrollTo({
        top: 0,
      });
    });
  };

  const removeAddressHandler = (id) => {
    // Check if the address being deleted is a default address
    const addressToDelete = allAddresses?.find((addr) => addr?.id === id);
    if (addressToDelete?.is_default_address) {
      showSnackbar(
        t("resource.common.address.default_address_cannot_be_deleted") ||
          "Default address cannot be deleted. Please contact support team",
        "error"
      );
      window.scrollTo({
        top: 0,
      });
      return;
    }

    setAddressLoader(true);
    removeAddress(id).then(async (res) => {
      if (res?.data?.removeAddress?.is_deleted) {
        showSnackbar(
          t("resource.common.address.address_deletion_success"),
          "success"
        );
        await fetchAddresses().then(() => {
          resetPage();
          setAddressLoader(false);
        });
      } else {
        showSnackbar(
          t("resource.common.address.address_deletion_failure"),
          "error"
        );
      }
      window.scrollTo({
        top: 0,
      });
    });
  };

  const getLocality = (posttype, postcode) => {
    return fpi
      .executeGQL(LOCALITY, {
        locality: posttype,
        localityValue: `${postcode}`,
        country:
          memoizedSelectedAdd?.country_iso_code ??
          selectedCountry?.meta?.country_code,
      })
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
            res?.errors?.[0]?.message ||
              t("resource.common.address.pincode_verification_failure"),
            "error"
          );
          data.showError = true;
          data.errorMsg =
            res?.errors?.[0]?.message ||
            t("resource.common.address.pincode_verification_failure");
          return data;
        }
      });
  };

  const customFooter = (
    <div className={styles.actionBtns}>
      {!isEditMode ? (
        <button
          // disabled={addressLoader}
          className={`${styles.commonBtn} ${styles.btn}`}
          type="submit"
        >
          {t("resource.facets.save_caps")}
        </button>
      ) : (
        <button
          // disabled={addressLoader}
          className={`${styles.commonBtn} ${styles.btn}`}
          type="submit"
        >
          {t("resource.common.address.update_address_caps")}
        </button>
      )}
      {!isEditMode ? (
        <button
          type="button"
          className={`${styles.commonBtn} ${styles.btn} ${styles.cancelBtn}`}
          onClick={onCancelClick}
        >
          {t("resource.facets.cancel_caps")}
        </button>
      ) : (
        <button
          // disabled={addressLoader}
          type="button"
          className={`${styles.commonBtn} ${styles.btn} ${styles.cancelBtn}`}
          onClick={() => removeAddressHandler(memoizedSelectedAdd?.id)}
        >
          {t("resource.facets.remove_caps")}
        </button>
      )}
    </div>
  );
  if (isLoading) {
    return (
      <div className={styles.loader}>
        <Loader
          containerClassName={styles.loaderContainer}
          loaderClassName={styles.customLoader}
        />
      </div>
    );
  }

  const handleCountryChange = async (e) => {
    // Set flag to prevent useEffect from resetting our selection
    isUserChangingCountry.current = true;
    
    const newSelectedCountry = countryCurrencies.find(
      (country) => country.name === e
    );
    
    if (!newSelectedCountry) {
      isUserChangingCountry.current = false;
      return;
    }
    
    setSelectedCountry(newSelectedCountry);
    
    try {
      // Fetch country details and update store (this updates form schema)
      const response = await fetchCountrieDetails({
        countryIsoCode: newSelectedCountry?.iso2,
      });
      
      if (response?.data?.country) {
        const countryInfo = response.data.country;
        
        // Get the default currency from the selected country object
        // This ensures we use the correct currency structure
        const defaultCurrency =
          newSelectedCountry?.currencies?.find((c) => c.is_default) ||
          newSelectedCountry?.currencies?.[0] ||
          countryInfo.currency;
        
        // Update global i18n details to sync header country
        // This ensures the header shows the selected country
        setI18nDetails(
          {
            iso: countryInfo.iso2,
            phoneCode: countryInfo.phone_code,
            name: countryInfo.display_name,
          },
          defaultCurrency?.code || countryInfo.currency?.code
        );
        
        // Reset flag after a delay to allow all state updates to complete
        // This prevents the useEffect from resetting the country back
        // Clear any existing timeout before setting a new one
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          isUserChangingCountry.current = false;
          timeoutRef.current = null;
        }, 1500);
      } else {
        // Reset flag even if fetch fails
        isUserChangingCountry.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    } catch (error) {
      // Reset flag on error
      isUserChangingCountry.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  const handleCountrySearch = (event) => {
    setCountrySearchText(event);
  };
  function convertDropDownField(inputField) {
    return {
      key: inputField.name,
      display: inputField.name,
    };
  }
  const getFilteredCountries = (selectedCountry) => {
    if (!countrySearchText) {
      return countryCurrencies?.map((country) => convertDropDownField(country)) || [];
    }
    return countryCurrencies?.filter(
      (country) =>
        country?.name
          ?.toLowerCase()
          ?.indexOf(countrySearchText?.toLowerCase()) !== -1 &&
        country?.uid !== selectedCountry?.uid
    );
  };
  // Group addresses into default and other
  const defaultAddress = allAddresses?.find((addr) => addr.is_default_address);
  const otherAddresses = allAddresses?.filter(
    (addr) => !addr.is_default_address
  );

  return (
    <div className={styles.main}>
      {!isEditMode && !isCreateMode ? (
        <div>
          <div className={styles.addressContainer}>
            <div className={styles.addressHeader}>
              <div className={`${styles.title} ${styles["bold-md"]}`}>
                {t("resource.common.address.my_address")}
                <span
                  className={`${styles.savedAddress} ${styles["bold-xxs"]}`}
                >
                  {allAddresses?.length
                    ? `(${allAddresses?.length} ${t("resource.profile.saved")})`
                    : ""}{" "}
                </span>
              </div>
              {allAddresses && allAddresses.length > 0 && (
                <div
                  className={`${styles.addAddr} ${styles["bold-md"]}`}
                  onClick={onCreateClick}
                >
                  <div className={styles.flexAlignCenter}>
                    <PlusAddressIcon className={styles.addAddressIcon} />
                  </div>
                  {t("resource.common.address.add_new_address_caps")}
                </div>
              )}
            </div>
          </div>

          {allAddresses.length > 0 && (
            <div className={styles.addressListWrapper}>
              {/* Default Address Section */}
              {defaultAddress && (
                <div className={styles.addressSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>
                      {t("resource.common.address.default_address") ||
                        "Default Address"}
                    </span>
                  </div>
                  <div className={styles.addressCardsContainer}>
                    <ProfileAddressCard
                      address={defaultAddress}
                      isDefault={true}
                      onEdit={onEditClick}
                      onDelete={removeAddressHandler}
                    />
                  </div>
                </div>
              )}

              {/* Other Addresses Section */}
              {otherAddresses && otherAddresses.length > 0 && (
                <div className={styles.addressSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>
                      {t("resource.common.address.other_addresses") ||
                        "Other Addresses"}
                    </span>
                  </div>
                  <div className={styles.addressCardsContainer}>
                    {otherAddresses.map((item, index) => (
                      <ProfileAddressCard
                        key={item.id || index}
                        address={item}
                        isDefault={false}
                        onEdit={onEditClick}
                        onDelete={removeAddressHandler}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {allAddresses && allAddresses.length === 0 && !addressLoader && (
            <ProfileEmptyState
              title={t("resource.common.address.no_address_added")}
              btnTitle={t("resource.common.address.add_new_address")}
              onBtnClick={onCreateClick}
              icon={<AddAddressIcon />}
            />
          )}
        </div>
      ) : (
        <>
          {(memoizedSelectedAdd || isCreateMode) && (
            <div className={styles.addressContainer}>
              <div className={styles.addressHeader}>
                <div className={`${styles.title} ${styles["bold-md"]}`}>
                  {isEditMode
                    ? t("resource.common.address.update_address")
                    : t("resource.common.address.add_new_address")}
                </div>
              </div>
            </div>
          )}
          {isEditMode && !memoizedSelectedAdd && !addressLoader ? (
            <ProfileEmptyState
              title={t("resource.common.address.address_not_found")}
              btnTitle={t("resource.common.address.return_to_my_address")}
              onBtnClick={() => navigate(location?.pathname)}
              style={{ height: "100%", paddingTop: "0", paddingBottom: "0" }}
            />
          ) : (
            <div className={styles.addressFormWrapper}>
              <AddressForm
                key={countryDetails?.iso2 || selectedCountry?.iso2}
                internationalShipping={isInternational}
                formSchema={formSchema}
                addressItem={memoizedSelectedAdd ?? defaultAddressItem}
                showGoogleMap={!!mapApiKey?.length}
                mapApiKey={mapApiKey}
                isNewAddress={isCreateMode}
                onAddAddress={addAddressHandler}
                onUpdateAddress={updateAddressHandler}
                onGetLocality={getLocality}
                customFooter={customFooter}
                fpi={fpi}
                setI18nDetails={handleCountryChange}
                handleCountrySearch={handleCountrySearch}
                getFilteredCountries={getFilteredCountries}
                selectedCountry={
                  memoizedSelectedAdd?.country
                    ? memoizedSelectedAdd?.country
                    : selectedCountry || currentCountry
                }
                countryDetails={countryDetails}
                user={userDataForForm}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileAddressPage;
