import { useEffect, useState } from "react";
import { useGlobalStore } from "fdk-core/utils";
import {
  ADDRESS_LIST,
  ADD_ADDRESS,
  UPDATE_ADDRESS,
  REMOVE_ADDRESS,
} from "../../queries/addressQuery";
import useInternational from "../../components/header/useInternational";
import { useAddressFormSchema, useGoogleMapConfig } from "../../helper/hooks";

const useAddress = (fpi, pageName) => {
  const {
    countries,
    fetchCountrieDetails,
    countryDetails,
    currentCountry,
    isInternational,
  } = useInternational({
    fpi,
  });
  const [selectedCountry, setSelectedCountry] = useState(currentCountry);
  const [countrySearchText, setCountrySearchText] = useState("");
  const { isGoogleMap, mapApiKey } = useGoogleMapConfig({ fpi });

  useEffect(() => {
    if (currentCountry) {
      setSelectedCountry(currentCountry);
    }
  }, [currentCountry]);

  useEffect(() => {
    fetchCountrieDetails({
      countryIsoCode: selectedCountry?.iso2 ?? countries?.[0]?.iso2,
    });
  }, [selectedCountry]);

  const { formSchema } = useAddressFormSchema({
    fpi,
    countryCode: selectedCountry?.phone_code,
    countryIso: selectedCountry?.iso2,
    addressTemplate: countryDetails?.fields?.address_template?.checkout_form,
    addressFields: countryDetails?.fields?.address,
  });

  function convertDropDownField(inputField) {
    return {
      key: inputField.display_name,
      display: inputField.display_name,
    };
  }

  const setI18nDetails = (e) => {
    const selectedCountry = countries.find(
      (country) => country.display_name === e
    );
    setSelectedCountry(selectedCountry);
    fetchCountrieDetails({ countryIsoCode: selectedCountry?.iso2 });
  };

  const handleCountrySearch = (event) => {
    setCountrySearchText(event);
  };

  const getFilteredCountries = (selectedCountry) => {
    if (!countrySearchText) {
      return countries.map((country) => convertDropDownField(country)) || [];
    }
    return countries?.filter(
      (country) =>
        country?.display_name
          ?.toLowerCase()
          ?.indexOf(countrySearchText?.toLowerCase()) !== -1 &&
        country?.id !== selectedCountry?.id
    );
  };

  const getFormattedAddress = (addr) => {
    return `${addr.address}, ${addr.area}${addr.landmark.length > 0 ? `, ${addr.landmark}` : ""}${addr.sector ? `, ${addr.sector}` : ""}${addr.city ? `, ${addr.city}` : ""}${addr.area_code ? `, - ${addr.area_code}` : ""}`;
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
    mapApiKey: isGoogleMap ? mapApiKey : "",
    fetchAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    getFormattedAddress,
    isInternationalShippingEnabled: isInternational,
    defaultFormSchema: formSchema,
    setI18nDetails,
    handleCountrySearch,
    getFilteredCountries,
    selectedCountry,
    countryDetails,
  };
};

export default useAddress;
