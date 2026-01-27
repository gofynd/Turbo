import React, { useEffect, useMemo, useCallback } from "react";
import styles from "./address-list.less";
import { useGlobalStore } from "fdk-core/utils";
import ListRenderer from "../list-renderer/list-renderer";
import { ADDRESS_LIST } from "../../../../../queries/addressQuery";
import { getAddressStr } from "../../../../../helper/utils";
import HomeIcon from "../../../../../assets/images/home-type.svg";
import WorkIcon from "../../../../../assets/images/office-type.svg";
import FriendsFamilyIcon from "../../../../../assets/images/friends-family.svg";
import LocationIcon from "../../../../../assets/images/location.svg";

function AddressList({
  fpi,
  className,
  searchText = "",
  onSelect = () => {},
  onListUpdate = () => {},
  countryCode = null,
}) {
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const { address } = useGlobalStore(fpi.getters.ADDRESS);

  const formatttedAddress = useMemo(() => {
    if (!address) return [];
    return address.map((item) => ({
      ...item,
      display_address: getAddressStr(item),
    }));
  }, [address]);

  const filteredAddress = useMemo(() => {
    let filtered = formatttedAddress;

    // Filter by country code if provided
    if (countryCode) {
      const upperCountryCode = String(countryCode).toUpperCase();
      filtered = filtered.filter((item) => {
        // Check country_iso_code first (primary field)
        if (item.country_iso_code) {
          return (
            String(item.country_iso_code).toUpperCase() === upperCountryCode
          );
        }
        // Fallback to country_code if country_iso_code is not available
        if (item.country_code) {
          return String(item.country_code).toUpperCase() === upperCountryCode;
        }
        // If address doesn't have country info, exclude it when filtering by country
        return false;
      });
    }

    // Filter by search text if provided
    if (searchText) {
      filtered = filtered.filter((item) =>
        item.display_address.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [searchText, formatttedAddress, countryCode]);

  const getAddressIcon = useCallback(({ address_type }) => {
    if (address_type === "Home") {
      return (
        <span>
          <HomeIcon className={styles.typeIcon} />
        </span>
      );
    } else if (address_type === "Work") {
      return (
        <span>
          <WorkIcon className={styles.typeIcon} />
        </span>
      );
    } else if (address_type === "Friends & Family") {
      return (
        <span>
          <FriendsFamilyIcon className={styles.typeIcon} />
        </span>
      );
    }
    return (
      <span>
        <LocationIcon />
      </span>
    );
  }, []);

  useEffect(() => {
    if (isLoggedIn && !address) {
      fpi.executeGQL(ADDRESS_LIST);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    onListUpdate(filteredAddress);
  }, [filteredAddress, onListUpdate]);

  return (
    <ListRenderer
      className={className}
      list={filteredAddress}
      isTitle={true}
      title="Saved Addresses"
      getIcon={getAddressIcon}
      onSelect={({ display_address, ...restItem }) => onSelect(restItem)}
      getKey={(i) => i.id}
      getPrimaryText={(i) => i.address_type}
      getSecondaryText={(i) => i.display_address}
    />
  );
}

export default AddressList;
