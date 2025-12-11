import React from "react";
import styles from "./store-locator.less";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import StoreCard from "./store-card";
import StoreLocatorField from "./store-locator-field";
import StoreEmptyState from "./store-empty-state";
import StoreInfoWindow from "./store-info-window";
import { StoreListShimmer } from "../shimmer";
import MapToggleIcon from "../../assets/images/store-locator-toggle-map.svg";
import ListToggleIcon from "../../assets/images/store-locator-toggle-list.svg";

const DEFAULT_CENTER = { lat: 19.076, lng: 72.8777 }; // Mumbai

// Helper to extract coordinates from store
const getStoreCoordinates = (store) => {
  if (store.coordinates) return store.coordinates;
  if (store.geo_location) {
    return {
      lat: store.geo_location.latitude,
      lng: store.geo_location.longitude,
    };
  }
  return null;
};

function StoreLocator({
  // State props
  searchValue,
  cityValue,
  selectedStore,
  displayStores,
  hasStores,
  storesWithCoordinates,
  isGeocoding,
  isLoading,
  mobileView,
  isMapLoaded,
  mapApiKey,
  mapCenter,
  calculateBounds,
  loadError,
  // Refs
  mapRef,
  stableCenterRef,
  // Handler props
  handleSearchChange,
  handleCityChange,
  handleGetDirection,
  setSelectedStore,
  setMobileView,
  setMapInitialized,
  // Options
  cityOptions = [],
}) {
  return (
    <div className={styles.storeLocatorContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <h2 className={styles.title}>Find a store near you</h2>
        <p className={styles.description}>
          Locate your nearest store for in-store shopping & pickup.
        </p>
      </div>

      {/* Search Section */}
      <div className={styles.searchSection}>
        {/* Search Input Field */}
        <div className={styles.searchField}>
          <StoreLocatorField
            type="search"
            placeholder="Enter city, Zip, or store name"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>

        {/* City Dropdown */}
        <div className={styles.dropdownField}>
          <StoreLocatorField
            type="dropdown"
            placeholder="Search by city"
            value={cityValue}
            onChange={handleCityChange}
            options={cityOptions}
          />
        </div>
      </div>

      {/* Mobile View Toggle */}
      <div className={styles.mobileViewToggle}>
        <button
          className={`${styles.toggleButton} ${
            mobileView === "map"
              ? styles.toggleButtonActive
              : styles.toggleButtonInactive
          }`}
          onClick={() => setMobileView("map")}
          type="button"
        >
          <MapToggleIcon
            aria-hidden="true"
            className={styles.toggleIcon}
            focusable="false"
          />
          <span>Map</span>
        </button>
        <button
          className={`${styles.toggleButton} ${
            mobileView === "list"
              ? styles.toggleButtonActive
              : styles.toggleButtonInactive
          }`}
          onClick={() => setMobileView("list")}
          type="button"
        >
          <ListToggleIcon
            aria-hidden="true"
            className={styles.toggleIcon}
            focusable="false"
          />
          <span>List</span>
        </button>
      </div>

      {/* Content Section */}
      <div className={styles.contentSection}>
        {/* Desktop/Tablet: Show both list and map side by side */}
        {/* Mobile: Show either list or map based on toggle */}
        {/* Stores List - Shows stores or empty state */}
        <div
          className={`${styles.storesList} ${
            mobileView === "list" ? styles.storesListMobile : ""
          }`}
        >
          {isLoading ? (
            <StoreListShimmer count={6} />
          ) : hasStores ? (
            <>
              <p className={styles.storesCount}>
                {displayStores.length} Store
                {displayStores.length !== 1 ? "s" : ""} Found
              </p>
              {displayStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  isSelected={selectedStore?.id === store.id}
                  onClick={() => {
                    setSelectedStore(store);
                    // On mobile, switch to map view when a store is selected
                    if (window.innerWidth <= 480) {
                      setMobileView("map");
                    }
                  }}
                  _original={store._original}
                />
              ))}
            </>
          ) : (
            <StoreEmptyState
              title="No Stores Found"
              description="There are no stores matching your search criteria. Please try different filters."
            />
          )}
        </div>

        {/* Map Section */}
        <div
          className={`${styles.mapSection} ${
            mobileView === "map" ? styles.mapSectionMobile : ""
          }`}
        >
          <div className={styles.mapContainer}>
            {loadError ? (
              <div className={styles.mapFallback}>
                <p style={{ color: "red" }}>
                  Error loading Google Maps:{" "}
                  {loadError.message || "Unknown error"}
                </p>
                <p style={{ fontSize: "12px", marginTop: "8px" }}>
                  Please check your API key and ensure the Maps JavaScript API
                  is enabled.
                </p>
              </div>
            ) : isMapLoaded && mapApiKey ? (
              <>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={stableCenterRef.current}
                  zoom={hasStores ? 12 : 10}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    gestureHandling: "greedy", // Allow page scrolling when scrolling outside map
                  }}
                  onLoad={(map) => {
                    console.log("GoogleMap component loaded successfully");
                    mapRef.current = map;
                    setMapInitialized(true);
                    // Set initial center if stores are available
                    if (storesWithCoordinates.length > 0) {
                      const initialCenter = mapCenter;
                      if (
                        initialCenter &&
                        initialCenter.lat !== DEFAULT_CENTER.lat &&
                        initialCenter.lng !== DEFAULT_CENTER.lng
                      ) {
                        if (storesWithCoordinates.length > 1) {
                          const bounds = calculateBounds(storesWithCoordinates);
                          if (bounds) {
                            map.fitBounds(bounds);
                          } else {
                            map.panTo(initialCenter);
                          }
                        } else {
                          map.panTo(initialCenter);
                        }
                      }
                    }
                  }}
                  onUnmount={() => {
                    mapRef.current = null;
                    setMapInitialized(false);
                  }}
                >
                  {storesWithCoordinates
                    .map((store) => {
                      const coords = getStoreCoordinates(store);
                      if (!coords) return null;

                      return (
                        <React.Fragment key={store.id}>
                          <Marker
                            position={coords}
                            title={store.name}
                            onClick={() => setSelectedStore(store)}
                            animation={
                              selectedStore?.id === store.id
                                ? window.google?.maps?.Animation?.BOUNCE
                                : null
                            }
                          />
                          {selectedStore?.id === store.id && (
                            <InfoWindow
                              position={coords}
                              options={{
                                pixelOffset: new window.google.maps.Size(
                                  0,
                                  -10
                                ),
                                disableAutoPan: false,
                                maxWidth: 320,
                                minWidth: 280,
                              }}
                            >
                              <div style={{ margin: 0, padding: 0 }}>
                                <StoreInfoWindow
                                  store={store}
                                  onGetDirection={() =>
                                    handleGetDirection(store)
                                  }
                                />
                              </div>
                            </InfoWindow>
                          )}
                        </React.Fragment>
                      );
                    })
                    .filter(Boolean)}
                </GoogleMap>
                {isGeocoding && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "rgba(255, 255, 255, 0.9)",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      zIndex: 1000,
                    }}
                  >
                    Updating map...
                  </div>
                )}
              </>
            ) : (
              <div className={styles.mapFallback}>
                {!mapApiKey ? (
                  <p>Unable to load the map</p>
                ) : (
                  <p>Loading map...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreLocator;
