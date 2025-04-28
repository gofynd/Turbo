import { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import {
  ADDRESS_LIST,
  ADD_ADDRESS,
  UPDATE_ADDRESS,
  REMOVE_ADDRESS,
} from "../../queries/addressQuery";
import { LOCALITY } from "../../queries/logisticsQuery";
import { useSnackbar } from "./hooks";
import { capitalize } from "../utils";
import { useGoogleMapConfig } from "./useGoogleMapConfig";

export const useAddress = ({ fpi, pageName }) => {
  const { t } = useGlobalTranslation("translation");
  const { showSnackbar } = useSnackbar();
  const { isGoogleMap, mapApiKey } = useGoogleMapConfig({ fpi });
  const addressData = useGlobalStore(fpi.getters.ADDRESS);
  const { loading: isLoading, address: allAddress } = addressData || {};
  const defaultAddress = useMemo(
    () => allAddress?.find((item) => item?.is_default_address),
    [allAddress]
  );

  const otherAddresses = useMemo(
    () => allAddress?.filter((item) => item.is_default_address !== true),
    [allAddress]
  );

  const getLocality = (posttype, postcode) => {
    return fpi
      .executeGQL(LOCALITY, {
        locality: `pincode`,
        localityValue: `${postcode}`,
      })
      .then((res) => {
        const data = { showError: false, errorMsg: "" };
        const localityObj = res?.data?.locality || false;
        if (localityObj) {
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

          return data;
        } else {
          showSnackbar(
            res?.errors?.[0]?.message || t("resource.common.address.pincode_verification_failure")
          );
          data.showError = true;
          data.errorMsg =
            res?.errors?.[0]?.message || t("resource.common.address.pincode_verification_failure");
          return data;
        }
      });
  };

  const fetchAddresses = () => {
    return fpi.executeGQL(ADDRESS_LIST);
  };

  const addAddress = (obj) => {
    const payload = {
      address2Input: {
        ...obj,
      },
    };
    return fpi.executeGQL(ADD_ADDRESS, payload);
  };

  const updateAddress = (data, addressId) => {
    const add = data;
    delete add?.custom_json;
    delete add?.otherAddressType;
    /* eslint-disable no-underscore-dangle */
    delete add?.__typename;
    const payload = {
      id: addressId,
      address2Input: {
        ...add,
      },
    };

    return fpi.executeGQL(UPDATE_ADDRESS, payload);
  };

  const removeAddress = (addressId) => {
    return fpi.executeGQL(REMOVE_ADDRESS, { id: addressId });
  };

  return {
    isLoading,
    fetchAddresses,
    allAddress,
    defaultAddress,
    otherAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    mapApiKey,
    showGoogleMap: isGoogleMap,
    getLocality,
  };
};
