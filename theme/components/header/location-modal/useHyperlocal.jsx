import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import {
  useThemeConfig,
  useThemeFeature,
  useLocalStorage,
  useDeliverPromise,
} from "../../../helper/hooks";
import { ADDRESS_LIST } from "../../../queries/addressQuery";
import { LOCALITY, DELIVERY_PROMISE } from "../../../queries/logisticsQuery";
import { getAddressStr } from "../../../helper/utils";

const useHyperlocal = (fpi) => {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const {
    isServiceabilityModalOpen = false,
    selectedAddress,
    serviceabilityInfo = {},
    countryDetails,
  } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [_, setPersistedAddress] = useLocalStorage(
    "selectedAddress",
    null,
    (value) => {
      if (value && !selectedAddress) {
        updatedSelectedAddress(value);
      }
      setIsAddressLoading(false);
    }
  );
  const { globalConfig } = useThemeConfig({ fpi });
  const { getServiceabilityPromise } = useDeliverPromise({ fpi });

  const { isServiceability, isServiceabilityMandatory } = useThemeFeature({
    fpi,
  });

  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const { address = [] } = useGlobalStore(fpi.getters.ADDRESS);

  const { is_delivery_promise: isDeliveryPromise } = globalConfig;
  const { deliveryTat, isServicibilityError } = serviceabilityInfo;

  const fetchDeliveryPromise = () => {
    fpi.custom.setValue("serviceabilityInfo", {
      ...serviceabilityInfo,
      isServicibilityError: false,
    });
    return fpi
      .executeGQL(DELIVERY_PROMISE)
      .then(({ data, errors }) => {
        if (errors) {
          throw errors?.[0];
        }
        fpi.custom.setValue("serviceabilityInfo", {
          ...serviceabilityInfo,
          deliveryTat: data?.deliveryPromise?.promise,
          isServicibilityError: false,
        });
        return data;
      })
      .catch((error) => {
        fpi.custom.setValue("serviceabilityInfo", {
          ...serviceabilityInfo,
          isServicibilityError: true,
        });
      });
  };

  const handleLocationUpdate = async (address) => {
    if (!address) return;
    await updatedSelectedAddress(address);
    fpi.custom.setValue("isServiceabilityModalOpen", false);
  };

  const updatedSelectedAddress = async (address) => {
    const response = await fetchLocality(address, {
      meta: address?.geo_location
        ? {
            latitude: address.geo_location.latitude,
            longitude: address.geo_location.longitude,
          }
        : {},
    });
    fpi.custom.setValue(`selectedAddress`, address);
    setPersistedAddress(address);
    return response;
  };

  const fetchLocality = (address, options) => {
    const payload = countryDetails?.fields?.serviceability_fields.reduce(
      (acc, field, index, fields) => {
        if (index === fields.length - 1) {
          acc.localityValue =
            address[field === "pincode" ? "area_code" : field];
          acc.locality = field;
          return acc;
        }
        acc[field] = address[field];
        return acc;
      },
      {
        country: countryDetails.iso2,
      }
    );

    return fpi
      .executeGQL(LOCALITY, payload, options)
      .then((response) => {
        if (response?.errors) {
          throw response?.errors?.[0];
        }
        return response;
      })
      .catch((error) => {});
  };

  const openServiceabilityModal = () => {
    fpi.custom.setValue("isServiceabilityModalOpen", true);
  };

  const closeServiceabilityModal = () => {
    if (isServiceabilityMandatory && !selectedAddress) {
      return;
    }
    fpi.custom.setValue("isServiceabilityModalOpen", false);
  };

  const isHeaderServiceability = useMemo(() => {
    const regexPattern =
      /^(\/cart\/bag\/?|\/cart\/checkout|\/profile\/orders(\/shipment\/\w+)?)$/;
    if (regexPattern.test(location.pathname)) {
      return false;
    }
    return isServiceability;
  }, [location.pathname, isServiceability]);

  const deliveryPromise = useMemo(() => {
    if (!isDeliveryPromise || !isServiceability) return null;
    if (isServicibilityError) {
      return t("resource.header.not_serviceable");
    }
    return getServiceabilityPromise(deliveryTat);
  }, [deliveryTat, isServicibilityError]);

  useEffect(() => {
    if (isServiceability && isDeliveryPromise && selectedAddress) {
      fetchDeliveryPromise();
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (isServiceability && isLoggedIn && !address.length) {
      fpi.executeGQL(ADDRESS_LIST);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isServiceability && !!address?.length && !selectedAddress) {
      const defaultAddress = address.find(
        (address) => address.is_default_address
      );
      if (defaultAddress && defaultAddress.geo_location) {
        handleLocationUpdate(defaultAddress);
      }
    }
  }, [isServiceability, address, selectedAddress]);

  return {
    isHeaderServiceability,
    isServiceability,
    isServiceabilityMandatory,
    isDeliveryPromise,
    deliveryPromise,
    isLoading: isAddressLoading,
    isServiceabilityModalOpen,
    deliveryAddress: useMemo(
      () => getAddressStr(selectedAddress),
      [selectedAddress]
    ),
    openServiceabilityModal,
    closeServiceabilityModal,
    handleLocationUpdate,
    updatedSelectedAddress,
  };
};

export default useHyperlocal;
