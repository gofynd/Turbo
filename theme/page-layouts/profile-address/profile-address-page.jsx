import React, { useState, useEffect, useMemo, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { LOCALITY } from "../../queries/logisticsQuery";
import useAddress from "../address/useAddress";
import Loader from "fdk-react-templates/components/loader/loader";
import "fdk-react-templates/components/loader/loader.css";
import { useSnackbar, useAddressFormSchema } from "../../helper/hooks";
import { capitalize, resetScrollPosition } from "../../helper/utils";
import styles from "./profile-address-page.less";
import AddressForm from "fdk-react-templates/components/address-form/address-form";
import AddressItem from "fdk-react-templates/components/address-item/address-item";
import "fdk-react-templates/components/address-form/address-form.css";
import "fdk-react-templates/components/address-item/address-item.css";
import useInternational from "../../components/header/useInternational";
import {
  useNavigate,
  useGlobalTranslation,
  useGlobalStore,
} from "fdk-core/utils";
import ProfileEmptyState from "fdk-react-templates/pages/profile/components/empty-state/empty-state";
import "fdk-react-templates/pages/profile/components/empty-state/empty-state.css";
import PlusAddressIcon from "../../assets/images/plus-address.svg";
import AddAddressIcon from "../../assets/images/add-address.svg";

const DefaultAddress = () => {
  const { t } = useGlobalTranslation("translation");
  return <span className={styles.defaultAdd}>{t("resource.common.default")}</span>;
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
    if (currentCountry) {
      setSelectedCountry(currentCountry);
    }
  }, [currentCountry]);

  const { formSchema, defaultAddressItem } = useAddressFormSchema({
    fpi,
    countryCode:
      memoizedSelectedAdd?.country_phone_code ?? countryDetails?.phone_code,
    countryIso: memoizedSelectedAdd?.country_iso_code ?? countryDetails?.iso2,
    addressTemplate: countryDetails?.fields?.address_template?.checkout_form,
    addressFields: countryDetails?.fields?.address,
    addressItem: memoizedSelectedAdd,
  });

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
    navigate({
      pathname: location.pathname,
      search: `edit=true&address_id=${addressId}`,
    });
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
    obj.country_phone_code = `+${obj.phone.countryCode}`;
    obj.phone = obj.phone.mobile;
    setAddressLoader(true);
    addAddress(obj).then(async (res) => {
      if (res?.data?.addAddress?.success) {
        showSnackbar(t("resource.common.address.address_addition_success"), "success");
        await fetchAddresses().then(() => {
          resetPage();
          setAddressLoader(false);
        });
      } else {
        showSnackbar(
          res?.errors?.[0]?.message ?? t("resource.common.address.new_address_creation_failure"),
          "error"
        );
      }
      window.scrollTo({
        top: 0,
      });
    });
  };

  const updateAddressHandler = (obj) => {
    obj.country_phone_code = `+${obj.phone.countryCode}`;
    obj.phone = obj.phone.mobile;
    setAddressLoader(true);
    updateAddress(obj, memoizedSelectedAdd?.id).then(async (res) => {
      if (res?.data?.updateAddress?.success) {
        showSnackbar(t("resource.common.address.address_update_success"), "success");
        await fetchAddresses().then(() => {
          resetPage();
          setAddressLoader(false);
        });
      } else {
        showSnackbar(
          res?.errors?.[0]?.message ?? t("resource.common.address.address_update_failure"),
          "error"
        );
      }
      window.scrollTo({
        top: 0,
      });
    });
  };

  const removeAddressHandler = (id) => {
    setAddressLoader(true);
    removeAddress(id).then(async (res) => {
      if (res?.data?.removeAddress?.is_deleted) {
        showSnackbar(t("resource.common.address.address_deletion_success"), "success");
        await fetchAddresses().then(() => {
          resetPage();
          setAddressLoader(false);
        });
      } else {
        showSnackbar(t("resource.common.address.address_deletion_failure"), "error");
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
            res?.errors?.[0]?.message || t("resource.common.address.pincode_verification_failure"),
            "error"
          );
          data.showError = true;
          data.errorMsg =
            res?.errors?.[0]?.message || t("resource.common.address.pincode_verification_failure");
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
    const selectedCountry = countries.find(
      (country) => country.display_name === e
    );
    setSelectedCountry(selectedCountry);
    try {
      const response = await fetchCountrieDetails({
        countryIsoCode: selectedCountry?.meta?.country_code,
      });
      if (response?.data?.country) {
        const countryInfo = response.data.country;
        setI18nDetails({
          iso: countryInfo.iso2,
          phoneCode: countryInfo.phone_code,
          name: countryInfo.display_name,
          currency: countryInfo.currency.code,
        });
      }
    } catch (error) { }
  };

  const handleCountrySearch = (event) => {
    setCountrySearchText(event);
  };
  function convertDropDownField(inputField) {
    return {
      key: inputField.display_name,
      display: inputField.display_name,
    };
  }
  const getFilteredCountries = (selectedCountry) => {
    if (!countrySearchText) {
      return countries?.map((country) => convertDropDownField(country)) || [];
    }
    return countries?.filter(
      (country) =>
        country?.display_name
          ?.toLowerCase()
          ?.indexOf(countrySearchText?.toLowerCase()) !== -1 &&
        country?.id !== selectedCountry?.id
    );
  };
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
                  {allAddresses?.length ? `${allAddresses?.length} ${t("resource.profile.saved")}` : ""}{" "}
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
            <div className={styles.addressItemContainer}>
              {allAddresses.map((item, index) => (
                <AddressItem
                  key={index}
                  onAddressSelect={onEditClick}
                  addressItem={item}
                  headerRightSlot={
                    item?.is_default_address && <DefaultAddress />
                  }
                  containerClassName={styles.addressItem}
                  style={{ border: "none" }}
                />
              ))}
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
                  {isEditMode ? t("resource.common.address.update_address") : t("resource.common.address.add_new_address")}
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
                key={countryDetails?.meta?.country_code}
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
                    : (selectedCountry?.display_name ??
                      countryDetails?.display_name)
                }
                countryDetails={countryDetails}
              />
            </div>
          )}
        </>
      )}
    </div >
  );
};

export default ProfileAddressPage;
