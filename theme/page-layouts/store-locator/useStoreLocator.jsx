import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useGoogleMapConfig } from "../../helper/hooks";
import { STORES_QUERY } from "../../queries/storesQuery";

const DEFAULT_CENTER = { lat: 19.076, lng: 72.8777 }; // Mumbai
const DEFAULT_RANGE = 50000; // 50km
const SEARCH_DEBOUNCE_MS = 500;
const INITIAL_PAGE_SIZE = 50; // Fetch more stores initially for better options

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

// Helper to format address string
const formatAddress = (store) => {
  const addressParts = [
    store.address,
    store.city,
    store.state,
    store.pincode || store.postal_code,
    store.country,
  ].filter(Boolean);
  return addressParts.length > 0
    ? addressParts.join(", ")
    : store.address || "";
};

// Helper to format phone number
const formatPhone = (contactNumbers) => {
  if (!contactNumbers) return "";
  if (typeof contactNumbers === "string") return contactNumbers;
  if (contactNumbers.number) {
    return `+${contactNumbers.country_code || ""} ${contactNumbers.number}`;
  }
  return "";
};

// Helper to create base store object (without geocoding)
const createStoreBase = (store) => ({
  id: store.uid || store.store_code,
  name: store.display_name || store.name || "",
  distance: null,
  address: formatAddress(store),
  phone: formatPhone(store.contact_numbers),
  hours: "Store hours not available",
  badges: store.store_type ? ["Pickup"] : [],
  coordinates: null,
  geo_location: null,
  _original: store,
});

// Helper to calculate bounds from stores
const calculateBounds = (stores) => {
  const bounds = new window.google.maps.LatLngBounds();
  stores.forEach((store) => {
    const coords = getStoreCoordinates(store);
    if (coords) bounds.extend(coords);
  });
  return bounds;
};

const useStoreLocator = ({ fpi, stores: propStores = [] }) => {
  const { mapApiKey } = useGoogleMapConfig({ fpi });
  const [searchValue, setSearchValue] = useState("");
  const [cityValue, setCityValue] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
  const [apiStores, setApiStores] = useState([]);
  const [allStores, setAllStores] = useState([]); // All stores for building filter options
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const stableCenterRef = useRef(DEFAULT_CENTER);
  const [mobileView, setMobileView] = useState("list"); // "list" or "map"
  const abortControllerRef = useRef(null); // For cancelling in-flight requests
  const searchDebounceRef = useRef(null);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Geocode address to get coordinates using Google Maps Geocoding API
  const geocodeAddress = useCallback(async (address) => {
    if (!address || !window.google || !window.google.maps) return null;

    // Check if Geocoder is available
    if (
      !window.google.maps.Geocoder ||
      typeof window.google.maps.Geocoder !== "function"
    ) {
      console.warn(
        "Geocoder is not available. Make sure Geocoding API is enabled for your API key."
      );
      return null;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      return new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng(),
            });
          } else {
            resolve(null);
          }
        });
      });
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    }
  }, []);

  // Transform API store data to match component format
  const transformStoreData = useCallback(
    async (store) => {
      const addressString = formatAddress(store);
      const formattedPhone = formatPhone(store.contact_numbers);
      const badges = store.store_type ? ["Pickup"] : [];

      // Get coordinates by geocoding the address
      let coordinates = null;
      let geo_location = null;

      if (
        addressString &&
        window.google?.maps?.Geocoder &&
        typeof window.google.maps.Geocoder === "function"
      ) {
        coordinates = await geocodeAddress(addressString);
        if (coordinates) {
          geo_location = {
            latitude: coordinates.lat,
            longitude: coordinates.lng,
          };
        }
      }

      // Calculate distance if user location is available
      let distance = null;
      if (userLocation && coordinates) {
        const distanceInKm = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          coordinates.lat,
          coordinates.lng
        );
        distance = `${distanceInKm.toFixed(1)} km`;
      }

      return {
        ...createStoreBase(store),
        distance,
        coordinates,
        geo_location,
      };
    },
    [userLocation, calculateDistance, geocodeAddress]
  );

  // Fetch stores from API
  const fetchStores = useCallback(
    async (filters = {}, isInitialFetch = false) => {
      if (!fpi) {
        return;
      }

      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      setIsGeocoding(false);
      if (!isInitialFetch) {
        setIsLoading(true);
      }

      try {
        const payload = {
          pageNo: filters.pageNo || 1,
          pageSize: filters.pageSize || 50,
        };

        // Add optional filters
        if (filters.city) payload.city = filters.city;
        if (filters.query) payload.query = filters.query;
        if (filters.latitude && filters.longitude) {
          payload.latitude = filters.latitude;
          payload.longitude = filters.longitude;
        }
        if (filters.range) payload.range = filters.range;
        const response = await fpi.executeGQL(STORES_QUERY, payload);

        if (response?.errors?.length) {
          console.error("GraphQL Error:", response.errors);
          setApiStores([]);
          return;
        }

        if (response?.data?.stores?.items) {
          // First, set stores without coordinates for immediate list rendering
          const initialStores = response.data.stores.items.map(createStoreBase);

          // If this is the initial fetch, store all stores for filter options
          if (isInitialFetch) {
            setAllStores(initialStores);
          }

          // Set stores immediately for list rendering
          setApiStores(initialStores);

          // Then geocode addresses in background (only if map is loaded and Geocoder is available)
          if (
            window.google?.maps?.Geocoder &&
            typeof window.google.maps.Geocoder === "function"
          ) {
            setIsGeocoding(true);
            try {
              const transformedStoresPromises = response.data.stores.items.map(
                (store) => transformStoreData(store)
              );
              const transformedStores = await Promise.all(
                transformedStoresPromises
              );
              setApiStores(transformedStores);

              // Update allStores with geocoded data if initial fetch
              if (isInitialFetch) {
                setAllStores(transformedStores);
              }
            } catch (geocodeError) {
              console.error("Geocoding error:", geocodeError);
              // Keep the initial stores even if geocoding fails
            } finally {
              setIsGeocoding(false);
            }
          }
        } else {
          setApiStores([]);
          if (isInitialFetch) {
            setAllStores([]);
          }
        }
      } catch (err) {
        // Don't log error if request was aborted
        if (err.name !== "AbortError") {
          console.error("Error fetching stores:", err);
        }
        if (!isInitialFetch) {
          setApiStores([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fpi, transformStoreData]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch initial stores on mount for building filter options
  useEffect(() => {
    if (!fpi) return;

    fetchStores(
      {
        pageNo: 1,
        pageSize: INITIAL_PAGE_SIZE,
      },
      true
    ); // isInitialFetch = true
  }, [fpi, fetchStores]);

  // Fetch stores when filters change
  useEffect(() => {
    if (!fpi || allStores.length === 0) return; // Wait for initial fetch to complete

    const filters = {
      pageNo: 1,
      pageSize: 50,
    };

    if (cityValue) filters.city = cityValue;
    if (searchValue) filters.query = searchValue;
    if (userLocation) {
      filters.latitude = userLocation.lat;
      filters.longitude = userLocation.lng;
      filters.range = DEFAULT_RANGE;
    }

    // Debounce search
    const timeoutId = setTimeout(
      () => {
        fetchStores(filters, false);
      },
      searchValue ? SEARCH_DEBOUNCE_MS : 0
    );

    return () => clearTimeout(timeoutId);
  }, [
    cityValue,
    searchValue,
    userLocation,
    fpi,
    fetchStores,
    allStores.length,
  ]);

  // Use API stores if available, otherwise fall back to props
  const displayStores = propStores.length > 0 ? propStores : apiStores;
  const hasStores = displayStores.length > 0;

  // Derive city dropdown options from ALL stores (not filtered)
  const deriveOptionsFromStores = useCallback(
    (field) => {
      const seen = new Map();
      // Use allStores to prevent options from disappearing when filtering
      const storesToUse = allStores.length > 0 ? allStores : displayStores;

      storesToUse.forEach((store) => {
        const rawValue =
          (typeof store[field] === "string" && store[field]) ||
          (store._original &&
            typeof store._original[field] === "string" &&
            store._original[field]) ||
          "";
        const value = rawValue.trim();
        if (!value) {
          return;
        }
        const normalized = value.toLowerCase();
        if (!seen.has(normalized)) {
          seen.set(normalized, value);
        }
      });

      return Array.from(seen.values())
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({
          key: `${field}-${value.toLowerCase().replace(/\s+/g, "-")}`,
          display: value,
        }));
    },
    [allStores, displayStores]
  );

  const derivedCityOptions = useMemo(
    () => deriveOptionsFromStores("city"),
    [deriveOptionsFromStores]
  );

  // Get stores with coordinates for map rendering
  const storesWithCoordinates = useMemo(
    () => displayStores.filter((store) => getStoreCoordinates(store) !== null),
    [displayStores]
  );

  // Calculate map center from store coordinates
  const mapCenter = useMemo(() => {
    const coords = storesWithCoordinates
      .map(getStoreCoordinates)
      .filter(Boolean);

    if (coords.length === 0) {
      return stableCenterRef.current;
    }

    const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const avgLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;

    const newCenter = { lat: avgLat, lng: avgLng };
    stableCenterRef.current = newCenter;
    return newCenter;
  }, [storesWithCoordinates]);

  // Update map center programmatically when stores change (prevents flickering)
  useEffect(() => {
    if (
      mapRef.current &&
      mapInitialized &&
      storesWithCoordinates.length > 0 &&
      !selectedStore
    ) {
      const newCenter = mapCenter;
      if (
        newCenter &&
        newCenter.lat !== DEFAULT_CENTER.lat &&
        newCenter.lng !== DEFAULT_CENTER.lng
      ) {
        // Only update if center actually changed
        const currentCenter = mapRef.current.getCenter();
        if (
          !currentCenter ||
          Math.abs(currentCenter.lat() - newCenter.lat) > 0.001 ||
          Math.abs(currentCenter.lng() - newCenter.lng) > 0.001
        ) {
          // Use smooth panning to prevent flicker
          if (storesWithCoordinates.length > 1) {
            mapRef.current.fitBounds(calculateBounds(storesWithCoordinates));
          } else {
            mapRef.current.panTo(newCenter);
          }
        }
      }
    }
  }, [storesWithCoordinates, mapCenter, selectedStore, mapInitialized]);

  // Update map when selected store changes
  useEffect(() => {
    if (selectedStore && mapRef.current) {
      const coords = getStoreCoordinates(selectedStore);
      if (coords) {
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.panTo(coords);
            mapRef.current.setZoom(15);
          }
        }, 100);
      }
    }
  }, [selectedStore]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Clear selected store when search changes
    if (selectedStore) {
      setSelectedStore(null);
    }
  };

  // Handle get direction click - redirect to Google Maps
  const handleGetDirection = useCallback((store) => {
    const coords = getStoreCoordinates(store);
    if (!coords) return;

    // Open Google Maps with the store location
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    window.open(googleMapsUrl, "_blank");
  }, []);

  return {
    // State
    searchValue,
    cityValue,
    selectedStore,
    displayStores,
    hasStores,
    storesWithCoordinates,
    isGeocoding,
    isLoading,
    userLocation,
    mapRef,
    mapInitialized,
    stableCenterRef,
    mobileView,
    mapApiKey,
    mapCenter,
    calculateBounds,
    cityOptions: derivedCityOptions,

    // Handlers
    setSearchValue,
    setCityValue,
    setSelectedStore,
    setMapInitialized,
    setMobileView,
    handleSearchChange,
    handleGetDirection,
  };
};

export default useStoreLocator;
