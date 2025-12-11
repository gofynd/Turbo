import React from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import useStoreLocator from "./useStoreLocator";
import StoreLocator from "../../components/store-locator/store-locator";
import { StoreLocatorShimmer } from "../../components/shimmer";

function StoreLocatorPage({
  fpi,
  stores = [],
  cityOptions: cityOptionsProp = [],
}) {
  const storeLocatorProps = useStoreLocator({ fpi, stores });
  const { mapApiKey, cityOptions, setCityValue, ...restStoreLocatorProps } =
    storeLocatorProps;
  const shouldLoadMap = Boolean(mapApiKey);

  const { isLoaded: isMapLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: mapApiKey || "",
    id: "google-map-script",
  });
  const mapReady = shouldLoadMap && isMapLoaded;

  const handleCityInputChange = (event) => {
    setCityValue(event?.target?.value || "");
  };

  // Show shimmer while map is loading
  if (shouldLoadMap && !mapReady && !loadError) {
    return <StoreLocatorShimmer view="list" />;
  }

  return (
    <StoreLocator
      mapApiKey={mapApiKey}
      {...restStoreLocatorProps}
      handleCityChange={handleCityInputChange}
      isMapLoaded={mapReady}
      loadError={shouldLoadMap ? loadError : null}
      cityOptions={cityOptionsProp.length > 0 ? cityOptionsProp : cityOptions}
    />
  );
}

export default StoreLocatorPage;
