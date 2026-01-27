import React from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalTranslation } from "fdk-core/utils";
import RefundSummary from "../components/refund-summary/refund-summary";
import MessageCard from "../components/message-card/message-card";
import ContacRefundSupport from "../components/contact-refund-support/contact-refund-support";
import Shimmer from "../components/shimmer/shimmer";
import SuccessCheck from "../assets/images/success-check.svg";
import StoreCredit from "../assets/images/store-credit.svg";
import BankIcon from "../assets/images/bank-icon.svg";
import UpiIcon from "../assets/images/upi-icon.svg";
import RefundToSourceIcon from "../assets/images/refund-to-source.svg";
import ShipmentVehicle from "../assets/images/shipment-vehicle.svg";
import useShipmentDetails from "../page-layouts/orders/useShipmentDetails";
import styles from "../styles/return-summary-status.less";

const includesIgnoreCase = (str = "", keyword = "") =>
  str?.toLowerCase().includes(keyword.toLowerCase());

const getRefundIcon = (displayName) => {
  if (includesIgnoreCase(displayName, "bank")) return <BankIcon />;
  if (includesIgnoreCase(displayName, "upi")) return <UpiIcon />;
  if (includesIgnoreCase(displayName, "store")) return <StoreCredit />;
  if (includesIgnoreCase(displayName, "source")) return <RefundToSourceIcon />;
  return null;
};

const getRefundText = (item, shipmentDetails, t) => {
  const { display_name, refund_amount, beneficiary_details } = item;
  const baseAmount = `₹${refund_amount}`;

  if (includesIgnoreCase(display_name, "bank")) {
    if (!beneficiary_details?.account_no && !beneficiary_details?.vpa_address) {
      return (
        <h5>
          <span className={styles.headingText}>{baseAmount}</span>{" "}
          {t(
            "resource.refund_order.refund_will_credited_to_beneficiary_account_msg"
          )}
        </h5>
      );
    }
    return (
      <h5>
        <span className={styles.headingText}>{baseAmount}</span>{" "}
        {t("resource.refund_order.will_be_credited_to_this_bank_account_no")}{" "}
        <span className={styles.headingText}>
          {beneficiary_details?.account_no?.slice(-4)}
        </span>
      </h5>
    );
  }

  if (includesIgnoreCase(display_name, "store")) {
    return (
      <h5>
        <span className={styles.headingText}>{baseAmount}</span>{" "}
        {t("resource.refund_order.store_credit_msg_on_return_summary_page")}
      </h5>
    );
  }

  if (includesIgnoreCase(display_name, "upi")) {
    return (
      <h5>
        <span className={styles.headingText}>{baseAmount}</span>{" "}
        {t("resource.refund_order.will_be_credited_to_this_upi_id")}{" "}
        <span className={styles.headingText}>
          {beneficiary_details?.vpa_address}
        </span>
      </h5>
    );
  }

  if (
    includesIgnoreCase(display_name, "source") ||
    includesIgnoreCase(display_name, "offline")
  ) {
    return (
      <h5>
        <span className={styles.headingText}>{baseAmount}</span>{" "}
        {t(
          "resource.refund_order.will_be_credited_back_to_the_original_payment_method"
        )}
      </h5>
    );
  }

  return null;
};

const RequestSubmittedSection = ({
  t,
  onContinueShopping,
  onTrackReturn,
  isLoading,
}) => (
  <div className={styles.requestSubmitedSection}>
    <SuccessCheck className={styles.successIcon} />
    <div className={styles.textContent}>
      <h5>{t("resource.refund_order.return_request_submitted")}</h5>
      <p>
        {t(
          "resource.refund_order.your_return_request_has_been_successfully_submitted_msg"
        )}
      </p>
    </div>
    <div className={styles.btnContainer}>
      <button
        className={styles.continueShoppingBtn}
        onClick={onContinueShopping}
      >
        {t("resource.auth.continue_shopping_caps")}
      </button>
      <button className={styles.trackReturnBtn} onClick={onTrackReturn}>
        {t("resource.common.track_return_status_caps")}
      </button>
    </div>
  </div>
);

const RefundDetailsSection = ({ shipmentDetails, t, isLoading }) => {
  const refundModes = shipmentDetails?.refund_modes ?? [];
  const refundMode = refundModes[0];
  const hasRefundModes = refundModes.length > 0;

  // payment type
  const isCOD =
    refundMode?.payment_identifiers?.includes("COD") ||
    shipmentDetails?.payment_info?.[0]?.payment_mode === "COD";

  const isPrepaid = !isCOD;

  // platform-level refund modes flag
  const isPlatformConfigOn = shipmentDetails?.is_refund_config_enabled === true;
  const isPlatformConfigOff =
    shipmentDetails?.is_refund_config_enabled === false;

  // shipment-level default refund mode
  // default_refund_mode === true  -> refund modes OFF for this shipment
  // default_refund_mode === false -> refund modes ON for this shipment
  const isShipmentModesOn = refundMode?.default_refund_mode === false;
  const isShipmentModesOff = refundMode?.default_refund_mode === true;

  // ------------------------------------------------------------------
  // A) SHOW CONTACT SUPPORT
  //
  // Case 1: platform config OFF  -> always Contact Customer Care (PP & COD)
  // Case 2: platform config ON + shipment modes OFF + COD -> Contact Customer Care
  // ------------------------------------------------------------------
  const showContactSupport =
    isPlatformConfigOff || (isPlatformConfigOn && isShipmentModesOff && isCOD);

  // ------------------------------------------------------------------
  // B) SHOW "Default: Refund To Source mode's msg"
  //
  // platform config ON + shipment modes OFF + Prepaid
  // (This is your: OFF refund_modes [] PP -> Default: Refund To Source mode's msg)
  // ------------------------------------------------------------------
  const showDefaultRefundToSourceMsg =
    isPlatformConfigOn && isShipmentModesOff && isPrepaid;

  // ------------------------------------------------------------------
  // C) SHOW "As per mode selection" (refund_modes list)
  //
  // platform config ON + shipment modes ON + refund_modes NOT empty
  // (This is your: ON + [ARRAY NOT BLANK] PP/COD -> As per mode selection)
  // ------------------------------------------------------------------
  const showRefundModes =
    isPlatformConfigOn &&
    isShipmentModesOn &&
    hasRefundModes &&
    !showContactSupport &&
    !showDefaultRefundToSourceMsg;

  return (
    <div
      className={styles.titleGroup}
      style={{
        padding: isLoading ? "0px" : "",
      }}
    >
      {isLoading ? (
        <Shimmer height="189px" className={styles.responsiveShimmer} />
      ) : (
        <>
          <div className={styles.amountInfo}>
            <span>{t("resource.refund_order.total_refund")}</span>
            <span className={styles.amountText}>
              ₹{shipmentDetails?.prices?.refund_amount}
            </span>
          </div>

          {showContactSupport ? (
            <ContacRefundSupport
              customClassName={styles.contactRefundSupport}
            />
          ) : showDefaultRefundToSourceMsg ? (
            <div className={styles.refundDetailsContainer}>
              <div className={styles.infoWithIcon}>
                <div className={styles.iconBox}>
                  {getRefundIcon("Refund To Source")}
                </div>
                <div className={styles.infoText}>
                  <h5>
                    <span className={styles.headingText}>
                      ₹{shipmentDetails?.prices?.refund_amount}
                    </span>{" "}
                    {t(
                      "resource.refund_order.will_be_refunded_to_your_original_payment_method"
                    )}
                  </h5>
                </div>
              </div>
              <MessageCard
                customClassName={styles.messageCardHeight}
                message={t(
                  "resource.refund_order.estimated_refund_within_7_days_msg"
                )}
              />
            </div>
          ) : (
            <div className={styles.refundDetailsContainer}>
              {refundModes.map((item, index) => (
                <React.Fragment key={index}>
                  <div className={styles.infoWithIcon}>
                    <div className={styles.iconBox}>
                      {getRefundIcon(item?.display_name)}
                    </div>
                    <div className={styles.infoText}>
                      {getRefundText(item, shipmentDetails, t)}
                    </div>
                  </div>
                  <MessageCard
                    customClassName={styles.messageCardHeight}
                    message={t(
                      "resource.refund_order.estimated_refund_within_7_days_msg"
                    )}
                  />
                </React.Fragment>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ProductItem = ({ bag, t }) => {
  const product = bag?.item;
  const productImage = product?.image?.[0] || "";
  const productName = product?.slug_key || "Unknown Product";
  const productSize = product?.size || "N/A";
  const productQuantity = bag?.quantity || 1;

  return (
    <div className={styles.productDetails}>
      <div className={styles.imageWrapper}>
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            onClick={() => {
              window.open(
                `/product/${product.slug_key}`,
                "_blank",
                "noopener,noreferrer"
              );
            }}
          />
        ) : (
          <div className={styles.placeholderImage}>
            {t("resource.checkout.no_image")}
          </div>
        )}
      </div>
      <div className={styles.infoWrapper}>
        <h6>{productName}</h6>
        <span className={styles.productSize}>
          {productSize}
          <span className={styles.productQuantity}>
            {" "}
            | {productQuantity} {t("resource.common.single_piece")}
            {productQuantity > 1 ? "s" : ""}
          </span>
        </span>
      </div>
    </div>
  );
};

const ProductsSection = ({ shipmentDetails, t, isLoading }) => {
  return (
    <div
      className={styles.productContainer}
      style={{
        width: "100%",
        minHeight: isLoading ? "170px" : "auto",
        padding: isLoading ? "0px" : "",
      }}
    >
      {isLoading ? (
        <Shimmer height="189px" className={styles.responsiveShimmer} />
      ) : (
        <>
          <div className={styles.statusContainer}>
            <div className={styles.idWrapper}>
              <ShipmentVehicle />
              <span>{shipmentDetails?.shipment_id}</span>
            </div>
            <div className={styles.status}>
              {shipmentDetails?.shipment_status?.title}
            </div>
          </div>

          {shipmentDetails?.bags?.length > 0 ? (
            shipmentDetails.bags.map((bag, index) => (
              <ProductItem key={index} bag={bag} t={t} />
            ))
          ) : (
            <div className={styles.noProducts}>
              {t("resource.common.no_products_found")}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const LeftSection = ({ shipmentDetails, t, isLoading, fpi }) => (
  <div
    className={styles.leftSection}
    style={{
      flex: 1,
      minWidth: 0,
      width: "100%",
    }}
  >
    <div className={styles.sectionContent}>
      <RefundDetailsSection
        shipmentDetails={shipmentDetails}
        t={t}
        isLoading={isLoading}
        fpi={fpi}
      />
      <ProductsSection
        shipmentDetails={shipmentDetails}
        t={t}
        isLoading={isLoading}
      />
    </div>
  </div>
);

const RightSection = ({ shipmentDetails, isLoading }) => {
  return (
    <div
      className={styles.rightSection}
      style={{ padding: isLoading ? "0px" : "" }}
    >
      {isLoading ? (
        <Shimmer height="189px" className={styles.responsiveShimmer} />
      ) : (
        <RefundSummary refundBreakup={shipmentDetails?.refund_breakup_values} />
      )}
    </div>
  );
};

const ReturnSummaryStatus = ({ fpi }) => {
  const navigate = useNavigate();
  const { t } = useGlobalTranslation("translation");

  const { isLoading, shipmentDetails } = useShipmentDetails(fpi);

  const handleContinueShopping = () => navigate("/");

  const handleTrackReturnStatus = () => {
    const route = `/profile/orders/shipment/${shipmentDetails?.shipment_id}`;
    navigate(route);
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        <RequestSubmittedSection
          t={t}
          onContinueShopping={handleContinueShopping}
          onTrackReturn={handleTrackReturnStatus}
          isLoading={isLoading}
        />

        {(isLoading || shipmentDetails) && (
          <div className={styles.subSection}>
            <LeftSection
              shipmentDetails={shipmentDetails}
              t={t}
              isLoading={isLoading}
              fpi={fpi}
            />
            <RightSection
              shipmentDetails={shipmentDetails}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnSummaryStatus;
