import React, {useEffect} from "react";
import styles from "./places-input.less";
import { useGlobalStore } from "fdk-core/utils";
import SearchIcon from "../../../../../assets/images/search.svg";
import FyInput from "@gofynd/theme-template/components/core/fy-input/fy-input.js";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";

const libraries = ["places"];

const PlacesInput = ({
  className,
  onChange = () => {},
  onplacesServiceReady = () => {},
  onPlacePredictionsUpdate = () => {},
}) => {
  const i18nDetails = useGlobalStore(fpi.getters.i18N_DETAILS);
  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    debounce: 500,
    libraries,
    options: {
      componentRestrictions: { country: i18nDetails?.countryCode },
    },
  });

  const fetchPlacePredictions = (e) => {
    getPlacePredictions({ input: e.target.value });
    onChange(e);
  };

  useEffect(() => {
    if (!!placesService) onplacesServiceReady(placesService);
  }, [placesService]);

  useEffect(() => {
    onPlacePredictionsUpdate({ placePredictions, isPlacePredictionsLoading });
  }, [placePredictions, isPlacePredictionsLoading]);

  return (
    <FyInput
      autoComplete="off"
      placeholder="Search delivery location"
      startAdornment={<SearchIcon />}
      onChange={fetchPlacePredictions}
      containerClassName={className}
      inputClassName={styles.placeSearchInput}
    />
  );
};

export default React.memo(PlacesInput);
