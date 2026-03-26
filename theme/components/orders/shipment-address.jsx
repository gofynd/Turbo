import React from "react";
import styles from "./styles/shipment-address.less";
import { useGlobalTranslation } from "fdk-core/utils";

function ShipmentAddress({ address }) {
  const { t } = useGlobalTranslation("translation");
  const getOptionalFields = (item) => {
    const postalCode = item?.area_code || item?.pincode;
    return `${item?.sector ? `${item?.sector}, ` : ""}${item?.city}, ${postalCode ? `- ${postalCode}` : ""}`;
  };

  return (
    <div className={`${styles.address} ${styles.lightsm}`}>
      <div className={`${styles.title} ${styles.boldsm}`}>
        {t("resource.common.address.address_caps")}
      </div>
      <div className={`${styles.lightsm}`}>
        {address?.name} - {address?.phone}
      </div>
      <div className={`${styles.lightsm}`}>{address?.address}</div>
      <div className={`${styles.lightsm}`}>
        {address?.area}, {address?.landmark}
      </div>
      <div className={`${styles.lightsm}`}>{getOptionalFields(address)}</div>
    </div>
  );
}

export default ShipmentAddress;
