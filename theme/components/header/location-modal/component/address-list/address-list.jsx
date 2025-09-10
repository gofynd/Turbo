import React, { useEffect, useMemo } from "react";
import styles from "./address-list.less";
import { useGlobalStore } from "fdk-core/utils";
import ListRenderer from "../list-renderer/list-renderer";
import { ADDRESS_LIST } from "../../../../../queries/addressQuery";
import { getAddressStr } from "../../../../../helper/utils";
import HomeIcon from "../../../../../assets/images/home-type.svg";
import WorkIcon from "../../../../../assets/images/office-type.svg";
import FriendsFamilyIcon from "../../../../../assets/images/friends-family.svg";
import LocationIcon from "../../../../../assets/images/location.svg";

function AddressList({ className, searchText = "", onSelect = () => {}, onListUpdate = () => {} }) {
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const { address } = useGlobalStore(fpi.getters.ADDRESS);

  const formatttedAddress = useMemo(
    () => {
      if (!address) return [];
      return address.map((item) => ({
        ...item,
        display_address: getAddressStr(item),
      }));
    },
    [address]
  );

  const filteredAddress = useMemo(() => {
    if (!searchText) return formatttedAddress;

    return formatttedAddress.filter((item) =>
      item.display_address.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, formatttedAddress]);

  function getAddressIcon({ address_type }) {
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
    return <span>
      <LocationIcon />
    </span>;
  }

  useEffect(() => {
    if (isLoggedIn && !address) {
      fpi.executeGQL(ADDRESS_LIST);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    onListUpdate(filteredAddress);
  }, [filteredAddress]);

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
