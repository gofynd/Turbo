import React, { useEffect, useState } from "react";
import {
  convertUTCDateToLocalDate,
  formatLocale,
} from "../../../../helper/utils";
import { useHyperlocalTat, useSyncedState } from "../../../../helper/hooks";
import styles from "./delivery-info.less"; // Import the module CSS
import DeliveryIcon from "../../../../assets/images/delivery.svg";
import LocationIcon from "../../../../assets/images/location-on.svg";
import FyndLogoIcon from "../../../../assets/images/fynd-logo.svg";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";

function DeliveryInfo({
  className,
  selectPincodeError,
  deliveryPromise,
  pincode,
  pincodeErrorMessage,
  checkPincode,
  setPincodeErrorMessage,
  pincodeInput,
  isValidDeliveryLocation,
  deliveryLocation,
  isServiceabilityPincodeOnly,
  fpi,
  showLogo = false,
}) {
  const { t } = useGlobalTranslation("translation");
  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale;
  const [postCode, setPostCode] = useState(pincode || "");
  const [tatMessage, setTatMessage] = useState("");
  const { isHyperlocal, convertUTCToHyperlocalTat } = useHyperlocalTat({ fpi });
  const { displayName, maxLength, validatePincode } = pincodeInput;

  useEffect(() => {
    if (isValidDeliveryLocation) {
      getDeliveryDate();
    }
  }, [deliveryPromise, isValidDeliveryLocation]);

  function changePostCode(pincode) {
    setPostCode(pincode);
    setTatMessage("");
    setPincodeErrorMessage("");
    if (validatePincode(pincode) === true) {
      checkPincode(pincode);
    }
  }

  const handlePincodeSubmit = (pincode) => {
    const result = validatePincode(pincode);
    if (result !== true) {
      setPincodeErrorMessage(result);
      return;
    }
    setPincodeErrorMessage("");
    checkPincode(pincode);
  };

  const getDeliveryDate = () => {
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    const { min, max } = deliveryPromise || {};

    if (!min) {
      return false;
    }

    if (isHyperlocal) {
      setTatMessage(convertUTCToHyperlocalTat(min));
      return;
    }

    const minDate = convertUTCDateToLocalDate(
      min,
      options,
      formatLocale(locale, countryCode)
    );
    const maxDate = convertUTCDateToLocalDate(
      max,
      options,
      formatLocale(locale, countryCode)
    );

    const deliveryMessage =
      min === max
        ? t("resource.product.delivery_on", { date: minDate })
        : t("resource.product.delivery_between", { minDate, maxDate });

    setTimeout(() => {
      setTatMessage(deliveryMessage);
    }, 1000);
  };

  const openInternationalDropdown = () => {
    fpi.custom.setValue("isI18ModalOpen", true);
  };

  const deliveryLocForIntlShipping = () => {
    return (
      <>
        {!isValidDeliveryLocation ? (
          <h4
            className={`${styles.deliveryLabel} b2 ${styles.cursor}`}
            onClick={openInternationalDropdown}
          >
            {t("resource.common.address.select_delivery_location")}
          </h4>
        ) : (
          <span className={`${styles.flexAlignCenter}`}>
            <span className={styles.deliveryLocation}>
              <span className={styles.deliveryLocation__bold}>
                {t("resource.product.delivery_at")}{" "}
              </span>
              <span
                onClick={openInternationalDropdown}
                className={styles.deliveryLocation__addrs}
              >
                {deliveryLocation}
              </span>
            </span>
          </span>
        )}
      </>
    );
  };

  const deliveryLoc = () => {
    return (
      <>
        <h4 className={`${styles.deliveryLabel} b2`}>
          {t("resource.common.address.select_delivery_location")}
        </h4>
        <div className={styles.delivery}>
          <input
            autoComplete="off"
            value={postCode}
            placeholder={t("resource.product.check_delivery_time")}
            className={`b2 ${styles.pincodeInput} ${styles.fontBody}`}
            type="text"
            maxLength={maxLength}
            onChange={(e) => changePostCode(e?.target?.value)}
          />
          <button
            type="button"
            className={`${styles.button} ${styles.fontBody}`}
            onClick={() => handlePincodeSubmit(postCode)}
            disabled={!postCode.length}
          >
            <span className={`${styles.flexAlignCenter}`}>
              {t("resource.facets.check")}
              <DeliveryIcon pincode className={`${styles.deliveryIcon}`} />
            </span>
          </button>
        </div>
        {selectPincodeError && !pincodeErrorMessage.length && (
          <div className={`captionNormal ${styles.emptyPincode}`}>
            {t("resource.product.enter_valid_pincode")}
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`${styles.deliveryInfo} ${className}`}>
      <div
        className={!isServiceabilityPincodeOnly ? styles.deliveryWrapper : ""}
      >
        {!isServiceabilityPincodeOnly && <LocationIcon />}
        <div className={styles.deliveryInfoWrapper}>
          {isServiceabilityPincodeOnly
            ? deliveryLoc()
            : deliveryLocForIntlShipping()}
          {!pincodeErrorMessage && !selectPincodeError && (
            <div
              className={`${styles.deliveryDate} ${styles.dateInfoContainer}`}
            >
              {isValidDeliveryLocation && tatMessage?.length > 0 && (
                <>
                  {isServiceabilityPincodeOnly && (
                    <DeliveryIcon className={`${styles.deliveryIcon}`} />
                  )}
                  <div className={`${styles.deliveryText} captionNormal`}>
                    {tatMessage}
                    {showLogo && (
                      <div className={styles.fyndLogo}>
                        <span>{t("resource.common.with")}</span>
                        <FyndLogoIcon style={{ marginLeft: "2px" }} />
                        <span className={styles.fyndText}>Fynd</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {pincodeErrorMessage && (
        <div className={`captionNormal ${styles.error}`}>
          {pincodeErrorMessage}
        </div>
      )}
    </div>
  );
}

export default DeliveryInfo;
