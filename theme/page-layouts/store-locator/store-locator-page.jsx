import React from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import useStoreLocator from "./useStoreLocator";
import StoreLocator from "../../components/store-locator/store-locator";
import { StoreLocatorShimmer } from "../../components/shimmer";

// Separate component that uses Google Maps loader
// This component is only rendered when we have a valid API key
function StoreLocatorWithMap({
  mapApiKey,
  cityOptions,
  cityOptionsProp,
  handleCityChange,
  restStoreLocatorProps,
}) {
  const { isLoaded: isMapLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: mapApiKey,
    id: "google-map-script",
  });

  // Show shimmer while map is loading
  if (!isMapLoaded && !loadError) {
    return <StoreLocatorShimmer view="list" />;
  }

  return (
    <StoreLocator
      mapApiKey={mapApiKey}
      {...restStoreLocatorProps}
      handleCityChange={handleCityChange}
      isMapLoaded={isMapLoaded}
      loadError={loadError}
      cityOptions={cityOptionsProp.length > 0 ? cityOptionsProp : cityOptions}
    />
  );
}

// Component without Google Maps (when API key is not configured)
function StoreLocatorWithoutMap({
  cityOptions,
  cityOptionsProp,
  handleCityChange,
  restStoreLocatorProps,
}) {
  return (
    <StoreLocator
      mapApiKey=""
      {...restStoreLocatorProps}
      handleCityChange={handleCityChange}
      isMapLoaded={false}
      loadError={null}
      cityOptions={cityOptionsProp.length > 0 ? cityOptionsProp : cityOptions}
    />
  );
}

function StoreLocatorPage({
  fpi,
  stores = [],
  cityOptions: cityOptionsProp = [],
}) {
  const storeLocatorProps = useStoreLocator({ fpi, stores });
  const { mapApiKey, cityOptions, handleCityChange, ...restStoreLocatorProps } =
    storeLocatorProps;

  // Only render the map component when we have a valid API key
  // This prevents useJsApiLoader from being called with different options
  if (mapApiKey) {
    return (
      <StoreLocatorWithMap
        mapApiKey={mapApiKey}
        cityOptions={cityOptions}
        cityOptionsProp={cityOptionsProp}
        handleCityChange={handleCityChange}
        restStoreLocatorProps={restStoreLocatorProps}
      />
    );
  }

  return (
    <StoreLocatorWithoutMap
      cityOptions={cityOptions}
      cityOptionsProp={cityOptionsProp}
      handleCityChange={handleCityChange}
      restStoreLocatorProps={restStoreLocatorProps}
    />
  );
}

export default StoreLocatorPage;
