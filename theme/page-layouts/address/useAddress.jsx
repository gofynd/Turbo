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
    countryCurrencies,
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
      countryIsoCode: selectedCountry?.iso2,
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
      key: inputField.name,
      display: inputField.name,
    };
  }

  const setI18nDetails = (e) => {
    const selectedCountry = countryCurrencies.find(
      (country) => country.name === e
    );
    setSelectedCountry(selectedCountry);
    fetchCountrieDetails({ countryIsoCode: selectedCountry?.iso2 });
  };

  const handleCountrySearch = (event) => {
    setCountrySearchText(event);
  };

  const getFilteredCountries = (selectedCountry) => {
    if (!countrySearchText) {
      return countryCurrencies.map((country) => convertDropDownField(country)) || [];
    }
    return countryCurrencies?.filter(
      (country) =>
        country?.name
          ?.toLowerCase()
          ?.indexOf(countrySearchText?.toLowerCase()) !== -1 &&
        country?.uid !== selectedCountry?.uid
    );
  };

  const getFormattedAddress = (addr) => {
    return `${addr.address}, ${addr.area}${addr.landmark.length > 0 ? `, ${addr.landmark}` : ""}${addr.sector ? `, ${addr.sector}` : ""}${addr.city ? `, ${addr.city}` : ""}${addr.area_code ? `, - ${addr.area_code}` : ""}`;
  };

  const fetchAddresses = () => {
    return fpi.executeGQL(ADDRESS_LIST);
  };

  const addAddress = (obj) => {
    // Convert country object to string (uid/id/iso2) if it's an object
    // Handles: API country objects (with id), countryCurrencies objects (with uid/iso2), and string values
    if (obj.country && typeof obj.country === "object" && obj.country !== null) {
      obj.country = obj.country.uid || obj.country.id || obj.country.iso2 || String(obj.country);
    }
    const payload = {
      address2Input: {
        ...obj,
      },
    };
    return fpi.executeGQL(ADD_ADDRESS, payload);
  };

  const updateAddress = (data, addressId) => {
    const add = data;
    // Convert country object to string (uid) if it's an object
    if (add.country && typeof add.country === "object" && add.country.uid) {
      add.country = add.country.uid;
    }
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
