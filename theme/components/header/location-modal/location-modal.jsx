import React, { useState, useMemo, useRef, useCallback } from "react";
import styles from "./location-modal.less";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useGlobalStore } from "fdk-core/utils";
import { getAddressFromComponents } from "../../../helper/utils";
import { LOCALITY, VALIDATE_ADDRESS } from "../../../queries/logisticsQuery";
import {
  useGoogleMapConfig,
  useStateRef,
  useAddress,
} from "../../../helper/hooks";
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import "@gofynd/theme-template/components/core/modal/modal.css";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button.js";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";
import Autocomplete from "react-google-autocomplete";
import PlacesInput from "./component/places-input/places-input";
import ServiceabilityInputs from "./component/serviceability-inputs/serviceability-inputs";
import AddressList from "./component/address-list/address-list";
import ListRenderer from "./component/list-renderer/list-renderer";
import EmptyLocation from "./component/empty-location/empty-location";
import BackIcon from "../../../assets/images/back.svg";
import SearchIcon from "../../../assets/images/search.svg";
import LocateIcon from "../../../assets/images/locate.svg";
import LocationPinIcon from "../../../assets/images/location-pin.svg";
import MarkerIcon from "../../../assets/images/marker.svg";
import LocationIcon from "../../../assets/images/location.svg";

const libraries = ["places"];

function LocationModal({
  fpi,
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
}) {
  const { isHeaderMap, mapApiKey } = useGoogleMapConfig({ fpi });
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    googleMapsApiKey: mapApiKey,
    libraries,
  });
  const { address = [] } = useGlobalStore(fpi.getters.ADDRESS);
  const i18nDetails = useGlobalStore(fpi.getters.i18N_DETAILS);
  const { selectedAddress, countryDetails } = useGlobalStore(
    fpi?.getters?.CUSTOM_VALUE
  );
  const [isMapDisplayed, setIsMapDisplayed] = useState(false);
  const [currentAddress, setCurrentAddress, currentAddressRef] =
    useStateRef(selectedAddress);
  const [placesInputText, setPlacesInputText] = useState("");
  const [placePredictions, setPlacePredictions] = useState({
    results: [],
    isLoading: false,
  });
  const [isValidationError, setIsValidationError] = useState(false);
  const [isLocationError, setIsLocationError] = useState(false);
  const [isAddressListEmpty, setIsAddressListEmpty] = useState(false);
  const mapRef = useRef(null);
  const placesServiceRef = useRef(null);
  const mapCoordinatesRef = useRef({
    lat: selectedAddress?.geo_location?.latitude ?? 0,
    lng: selectedAddress?.geo_location?.longitude ?? 0,
  });

  const { fetchAddresses, updateAddress } = useAddress({ fpi });

  const isMapCountryError = useMemo(() => {
    return (
      !!currentAddress?.country_iso_code &&
      i18nDetails?.countryCode !== currentAddress?.country_iso_code
    );
  }, [i18nDetails, currentAddress]);

  const handleCurrentLocClick = () => {
    if (!navigator?.geolocation || !mapApiKey) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (isHeaderMap) {
          setCurrentAddress(null);
          mapCoordinatesRef.current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setIsMapDisplayed(true);
          setPlacesInputText("");
        } else {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${mapApiKey}`
            );
            const data = await response.json();
            if (data.results.length > 0) {
              const address = getAddressFromComponents(
                data.results[0].address_components
              );
              if (address) {
                const currentLocation = {
                  ...address,
                  geo_location: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  },
                };
                setCurrentAddress(currentLocation);
                handleAddressConfirmation(currentLocation);
              }
            } else {
              throw new Error("No results found");
            }
          } catch (error) {
            setIsLocationError(true);
          }
        }
      },
      (err) => {
        setIsLocationError(true);
      }
    );
  };

  const fetchLocality = (pincode) => {
    const payload = {
      locality: "pincode",
      localityValue: pincode,
      country: countryDetails?.iso2,
    };

    return fpi.executeGQL(LOCALITY, payload).then((response) => {
      if (response?.errors) {
        throw response?.errors?.[0];
      }
      return response;
    });
  };

  const handlePincodeSubmit = async ({ pincode }, { setError }) => {
    try {
      await fetchLocality(pincode);
      onConfirm({ area_code: pincode });
      // fetchDeliveryPromise()
      //   .then(() => {
      //     onConfirm({ area_code: pincode })
      //     // handleLocationModalClose();
      //   })
      //   .catch((error) => {
      //     // setServicibilityError({
      //     //   message: error?.message || "Something went wrong",
      //     // });
      //   });
    } catch (error) {
      setError("root", error?.message || "Something went wrong");
    }
  };

  const handlePlaceOnChange = useCallback((e) => {
    setPlacesInputText(e.target.value);
    setIsLocationError(false);
  }, []);

  const handlePlacesServiceReady = useCallback((service) => {
    placesServiceRef.current = service;
  }, []);

  const handlePlacePredictionsUpdate = useCallback(
    ({ placePredictions, isPlacePredictionsLoading }) => {
      setPlacePredictions({
        results: placePredictions,
        isLoading: isPlacePredictionsLoading,
      });
    },
    []
  );

  const handlePlaceSelect = (place) => {
    if (!place.place_id || !placesServiceRef.current) {
      return;
    }

    placesServiceRef.current?.getDetails(
      {
        placeId: place.place_id,
        fields: ["name", "address_components", "geometry"],
      },
      (placeDetails) => {
        if (placeDetails?.geometry?.location) {
          const position = {
            lat: placeDetails.geometry.location.lat(),
            lng: placeDetails.geometry.location.lng(),
          };
          mapCoordinatesRef.current = position;
          mapRef.current?.panTo(mapCoordinatesRef.current);
        }
        // isLocationAvailable.current = true;
        const address = getAddressFromComponents(
          placeDetails.address_components,
          placeDetails.name
        );
        const selectedPlace = {
          ...address,
          geo_location: {
            latitude: placeDetails.geometry.location.lat(),
            longitude: placeDetails.geometry.location.lng(),
          },
        };
        setCurrentAddress(selectedPlace);
        if (isHeaderMap) {
          setIsMapDisplayed(true);
        } else {
          handleAddressConfirmation(selectedPlace);
        }
        setPlacesInputText("");
      }
    );
  };

  const handleAddressSelect = async (address) => {
    if (!address.geo_location && address.area_code && isHeaderMap) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${address.area_code}&key=${mapApiKey}`
        );
        const data = await response.json();
        if (data.results.length > 0) {
          const location = data.results[0].geometry.location;
          mapCoordinatesRef.current = {
            lat: location.lat,
            lng: location.lng,
          };
          const { id, ...restAddress } = address;
          setCurrentAddress({
            ...restAddress,
            geo_location: {
              latitude: mapCoordinatesRef.current.lat,
              longitude: mapCoordinatesRef.current.lng,
            },
          });
          setIsMapDisplayed(true);
          setPlacesInputText("");
        } else {
          console.warn("No results found for the provided pincode.");
        }
      } catch (error) {
        console.error("Error fetching coordinates from pincode:", error);
      }
      return;
    }

    if (!address?.is_default_address) {
      const { geo_location, ...restAddress } = address;
      const { errors } = await updateAddress(
        {
          ...restAddress,
          geo_location: geo_location || undefined,
          is_default_address: true,
        },
        address.id
      );
      if (!errors) {
        fetchAddresses();
        onConfirm(address);
      }
    } else {
      onConfirm(address);
    }
  };

  const handleServiceabilityFormSubmit = async (values) => {
    const updatedAddress = {
      ...(isValidationError
        ? { geo_location: currentAddress?.geo_location }
        : {}),
      ...values,
    };
    setCurrentAddress(updatedAddress);
    onConfirm(updatedAddress);
  };

  const handleLocateClick = () => {
    if (!navigator?.geolocation || !mapApiKey) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        mapRef.current?.panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {}
    );
  };

  const handleAddressConfirmation = async (
    addressToValidate = currentAddress
  ) => {
    const {
      address,
      address1,
      address2,
      area,
      landmark,
      area_code,
      sector,
      city,
      state,
      name,
      phone,
      email,
      country_iso_code,
    } = addressToValidate;
    const { data, errors } = await fpi.executeGQL(VALIDATE_ADDRESS, {
      countryIsoCode: country_iso_code,
      templateName: "plp",
      validateAddressRequestInput: {
        ...{
          address,
          address1,
          address2,
          area,
          landmark,
          sector,
          city,
          state,
          name,
          phone,
          email,
        },
        pincode: area_code,
      },
    });
    if (errors) {
      setIsValidationError(true);
      setIsMapDisplayed(false);
      return;
    }
    onConfirm(addressToValidate);
    return data;
  };

  const GoogleMapProps = useMemo(
    () => ({
      onLoad: (map) => {
        mapRef.current = map;
      },
      onIdle: () => {
        if (mapRef.current) {
          const newCenter = mapRef.current.getCenter();
          const lat = newCenter.lat();
          const lng = newCenter.lng();
          if (
            mapCoordinatesRef.current.lat !== lat ||
            mapCoordinatesRef.current.lng !== lng ||
            !currentAddressRef.current
          ) {
            mapCoordinatesRef.current = { lat, lng };
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results[0]) {
                const address = getAddressFromComponents(
                  results[0].address_components
                );
                setCurrentAddress({
                  ...address,
                  geo_location: {
                    latitude: mapCoordinatesRef.current.lat,
                    longitude: mapCoordinatesRef.current.lng,
                  },
                });
              } else {
                console.error("Geocoder failed:", status);
              }
            });
          }
          // isLocationAvailable.current = false;
        }
      },
    }),
    []
  );

  const AutocompleteProps = useMemo(
    () => ({
      onPlaceSelected: (place) => {
        if (place?.geometry) {
          const location = place?.geometry?.location;
          mapRef.current?.panTo({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          console.error("No geometry available for selected place");
        }
      },
    }),
    []
  );

  const displayAddress = useMemo(() => {
    if (!currentAddress) return null;
    return {
      addressLine1: [currentAddress.address, currentAddress.area]
        .filter(Boolean)
        .join(", "),
      addressLine2: [
        currentAddress.landmark,
        currentAddress.city,
        currentAddress.state,
        currentAddress.area_code,
      ]
        .filter(Boolean)
        .join(", "),
    };
  }, [currentAddress]);

  return (
    <Modal
      isOpen={isOpen}
      hideHeader
      containerClassName={`${styles.locationModaContainer} ${isMapDisplayed ? styles.isMapView : ""} ${isValidationError ? styles.validationError : ""}`}
      bodyClassName={styles.locationmodalBody}
      closeDialog={onClose}
      ignoreClickOutsideForClass="fydrop"
    >
      {!isMapDisplayed ? (
        <div className={styles.locationInputWrapper}>
          <div className={styles.modalHeader}>
            <BackIcon
              className={styles.modalHeaderBackIcon}
              onClick={onClose}
            />
            <h3 className={styles.modalTitle}>Deliver to</h3>
          </div>
          <div className={styles.modalContent}>
            {isHeaderMap && !isValidationError ? (
              isMapLoaded && (
                <PlacesInput
                  className={styles.placesInputWrapper}
                  onChange={handlePlaceOnChange}
                  onplacesServiceReady={handlePlacesServiceReady}
                  onPlacePredictionsUpdate={handlePlacePredictionsUpdate}
                />
              )
            ) : (
              <ServiceabilityInputs
                className={styles.pincodeInputWrapper}
                fpi={fpi}
                onSubmit={handleServiceabilityFormSubmit}
              />
            )}
            {isHeaderMap && !isValidationError && (
              <button
                type="button"
                className={styles.currentLocation}
                aria-label="Use Current Location"
                onClick={handleCurrentLocClick}
              >
                use my current location
              </button>
            )}
            {isLocationError && (
              <p className={styles.errorText}>
                We can’t access your location. Please enter it manually or allow
                access in browser
              </p>
            )}
            <div className={styles.suggestionsContainer}>
              {!isValidationError && (
                <AddressList
                  className={styles.listWrapper}
                  searchText={placesInputText}
                  onSelect={handleAddressSelect}
                  onListUpdate={(list) => {
                    setIsAddressListEmpty(list.length === 0);
                  }}
                />
              )}
              {!isValidationError && (
                <ListRenderer
                  className={styles.listWrapper}
                  title="Search Results"
                  isTitle={!!address.length}
                  list={placePredictions.results}
                  getIcon={() => (
                    <span>
                      <LocationIcon />
                    </span>
                  )}
                  getKey={(i) => i.place_id}
                  getPrimaryText={(i) =>
                    i.structured_formatting?.main_text || ""
                  }
                  getSecondaryText={(i) =>
                    i.structured_formatting?.secondary_text || ""
                  }
                  onSelect={handlePlaceSelect}
                />
              )}
              {!!placesInputText &&
                !placePredictions.results?.length &&
                !placePredictions.isLoading &&
                isAddressListEmpty && <EmptyLocation />}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.mapWrapper}>
          <div className={styles.mapHeader}>
            <BackIcon onClick={() => setIsMapDisplayed(false)} />
            <h3 className={styles.title}>Location Information</h3>
            <h3 className={styles.mobileTitle}>Deliver to</h3>
          </div>
          <div className={styles.mapContainer}>
            {isMapLoaded && (
              <>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={mapCoordinatesRef.current}
                  zoom={19}
                  options={{
                    disableDefaultUI: true,
                    gestureHandling: "greedy",
                  }}
                  {...GoogleMapProps}
                />
                <div className={styles.autocompleteWrapper}>
                  <SearchIcon className={styles.autocompleteIcon} />
                  <Autocomplete
                    className={styles.autocompleteInput}
                    placeholder="Search for pincode, area, street name..."
                    options={{
                      componentRestrictions: {
                        country: i18nDetails?.countryCode,
                      },
                      types: ["geocode", "establishment"],
                    }}
                    {...AutocompleteProps}
                  />
                </div>
                <span className={styles.markerIcon}>
                  <MarkerIcon />
                  <div className={styles.markerLabel}>
                    <div>Your order will be delivered here</div>
                    <div className={styles.markerLabelText}>
                      Move pin to your exact location
                    </div>
                  </div>
                </span>
                <FyButton
                  aria-label="Use Current Location"
                  onClick={handleLocateClick}
                  className={`${styles.locateIconBtn} ${isMapCountryError && styles.locationError}`}
                >
                  <LocateIcon />
                </FyButton>
                {isMapCountryError && (
                  <p
                    className={styles.countryError}
                  >{`Please select a location within ${countryDetails.display_name}`}</p>
                )}
              </>
            )}
          </div>
          <div className={styles.mapFooter}>
            {displayAddress && (
              <div className={styles.addressContainer}>
                <span>
                  <LocationPinIcon className={styles.locationPinIcon} />
                </span>
                <div className={styles.address}>
                  {!!displayAddress.addressLine1 && (
                    <h4 className={styles.title}>
                      {displayAddress.addressLine1}
                    </h4>
                  )}
                  {!!displayAddress.addressLine2 && (
                    <p className={styles.subTitle}>
                      {displayAddress.addressLine2}
                    </p>
                  )}
                </div>
              </div>
            )}
            <FyButton
              onClick={() => handleAddressConfirmation()}
              disabled={isMapCountryError}
            >
              CONFIRM
            </FyButton>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default LocationModal;
