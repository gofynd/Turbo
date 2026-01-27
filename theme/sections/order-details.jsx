import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { BlockRenderer } from "fdk-core/components";
import ShipmentItem from "@gofynd/theme-template/components/shipment-item/shipment-item";
import "@gofynd/theme-template/components/shipment-item/shipment-item.css";
import ShipmentTracking from "@gofynd/theme-template/components/shipment-tracking/shipment-tracking";
import "@gofynd/theme-template/components/shipment-tracking/shipment-tracking.css";
import ShipmentBreakup from "@gofynd/theme-template/components/shipment-breakup/shipment-breakup";
import "@gofynd/theme-template/components/shipment-breakup/shipment-breakup.css";
import ShipmentAddress from "@gofynd/theme-template/components/shipment-address/shipment-address";
import "@gofynd/theme-template/components/shipment-address/shipment-address.css";
import PaymentDetailCard from "@gofynd/theme-template/components/payment-detail-card/payment-detail-card";
import "@gofynd/theme-template/components/payment-detail-card/payment-detail-card.css";
import useShipmentDetails from "../page-layouts/orders/useShipmentDetails";
import EmptyState from "../components/empty-state/empty-state";
import Loader from "../components/loader/loader";
import {
  useGlobalTranslation,
  useNavigate,
  useGlobalStore,
  useFPI,
} from "fdk-core/utils";
import OrderDeliveryIcon from "../assets/images/order-delivery.svg";
import CrossIcon from "../assets/images/cross-black.svg";
import DefaultImage from "../assets/images/default-image.svg";
import { detectMobileWidth, translateDynamicLabel } from "../helper/utils";
import ScheduleIcon from "../../theme/assets/images/schedule.svg";
import OrderPendingIcon from "../assets/images/order-pending.svg";
import { getGroupedShipmentBags } from "../helper/utils";
import { ADD_TO_CART, FULFILLMENT_OPTIONS } from "../queries/pdpQuery";
import { CART_ITEMS_COUNT } from "../queries/wishlistQuery";
import { fetchCartDetails } from "../page-layouts/cart/useCart";
import { useSnackbar } from "../helper/hooks";
import "@gofynd/theme-template/components/core/modal/modal.css";
import styles from "../page-layouts/profile/styles/profile-my-order-shipment-page.less";

const Modal = React.lazy(
  () => import("@gofynd/theme-template/components/core/modal/modal")
);

function ShipmentPolling() {
  const { t } = useGlobalTranslation("translation");
  return (
    <EmptyState
      description={t("resource.order.polling.description")}
      Icon={<OrderPendingIcon />}
      title={t("resource.order.polling.pending")}
      btnLink="/profile/orders"
      btnTitle={t("resource.common.continue_shopping")}
    />
  );
}
import CreditStore from "../assets/images/store-credit.svg";
import BankIcon from "../assets/images/bank-icon.svg";
import UpiIcon from "../assets/images/upi-icon.svg";
import RefundToSourceIcon from "../assets/images/refund-to-source.svg";
import ContacRefundSupport from "../components/contact-refund-support/contact-refund-support";
import RefundSummary from "../components/refund-summary/refund-summary";
import Breadcrumb from "../components/breadcrumb/breadcrumb";

export function Component({ blocks, globalConfig, fpi }) {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();
  const { fulfillment_option } = useGlobalStore(fpi.getters.APP_FEATURES);
  const { showSnackbar } = useSnackbar();
  const {
    isLoading,
    shipmentDetails,
    invoiceDetails,
    getInvoice,
    showPolling,
    attempts,
  } = useShipmentDetails(fpi);
  const [initial, setInitial] = useState(true);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState("");
  const [goToLink, setGoToLink] = useState("");
  const [isMobile, setIsMobile] = useState(detectMobileWidth());
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(detectMobileWidth());
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaLoadError, setMediaLoadError] = useState(false);

  const includesIgnoreCase = (str = "", keyword = "") =>
    str?.toLowerCase().includes(keyword.toLowerCase());

  useEffect(() => {
    if (
      shipmentDetails?.shipment_id &&
      shipmentDetails?.show_download_invoice === true
    ) {
      getInvoice({
        shipmentId: shipmentDetails.shipment_id,
      });
    }
  }, [shipmentDetails?.shipment_id, shipmentDetails?.show_download_invoice]);

  const {
    bags: shipmentBags,
    bundleGroups,
    bundleGroupArticles,
  } = useMemo(() => {
    return getGroupedShipmentBags(shipmentDetails?.bags, {
      isPartialCheck: !!(shipmentDetails?.can_return && !initial),
    });
  }, [shipmentDetails?.bags, shipmentDetails?.can_return, initial]);

  const getSlicedGroupedShipmentBags = () => {
    return shipmentBags.slice(0, show ? shipmentBags?.length : 1 * 2);
  };

  const toggelInit = (item) => {
    setInitial(!initial);
    setGoToLink(item.link);
  };

  const goToReasons = () => {
    if (shipmentDetails?.can_cancel || shipmentDetails?.can_return) {
      const querParams = new URLSearchParams(location.search);
      querParams.set("selectedBagId", selectId);
      navigate(
        goToLink + (querParams?.toString() ? `?${querParams.toString()}` : "")
      );
    }
  };

  const onselectreason = (id) => {
    setSelectId(id);
  };

  const btndisable = useMemo(() => {
    return !!selectId;
  }, [selectId]);

  const showMore = () => {
    setShow(true);
  };

  const showLess = () => {
    setShow(false);
  };

  const isVideo = (url) => /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url);
  const ndrWindowExhausted = () => {
    const endDateStr =
      shipmentDetails?.ndr_details?.allowed_delivery_window?.end_date;
    if (!endDateStr) return false;

    const endDate = new Date(endDateStr);
    const now = new Date();

    return endDate < now;
  };

  /**
   * Formats a UTC date string to a localized date string, using the browser's
   * local timezone. For users in Saudi it will use browser time zone (usually Asia/Riyadh if their browser/device is set to that timezone),
   * and for Indian users the same (Asia/Kolkata), so output depends on the user's system/browser time zone.
   */
  function formatUTCToDateString(utcString) {
    if (!utcString) return "";

    const date = new Date(utcString);

    // Use browser's local timezone with fallback to UTC
    const browserTimezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: browserTimezone,
    };

    // Use 'en-GB' for DD MMM YYYY pattern and replace for formatting if needed
    return date
      .toLocaleDateString("en-GB", options)
      .replace(" ", " ")
      .replace(",", ",");
  }

  const openMediaModal = (media) => {
    setSelectedMedia(media);
    setIsMediaModalOpen(true);
    setMediaLoadError(false);
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
    setIsMediaModalOpen(false);
    setMediaLoadError(false);
  };

  const handleMediaError = () => {
    setMediaLoadError(true);
  };

  const isCODAndNoDeliveryDate =
    shipmentDetails?.payment_info?.some(
      (item) =>
        item.payment_mode === "COD" || item.payment_mode === "NON_PREPAID"
    ) && shipmentDetails?.delivery_date === null;

  const isRefundCompleted = (refundStatus) =>
    refundStatus?.status === "refund_completed";

  const refundModes = shipmentDetails?.refund_modes ?? [];
  const refundMode = refundModes[0];
  const hasRefundModes = refundModes.length > 0;

  // 1) Platform-level refund config
  // is_refund_config_enabled = true  -> refund config ON on platform
  // is_refund_config_enabled = false -> refund config OFF on platform
  const isPlatformConfigOn = shipmentDetails?.is_refund_config_enabled === true;
  const isPlatformConfigOff =
    shipmentDetails?.is_refund_config_enabled === false;

  // 2) Shipment-level "refund modes" toggle via default_refund_mode
  // default_refund_mode = true  -> refund modes are OFF from platform (use default handling)
  // default_refund_mode = false -> refund modes are ON (as per mode selection)
  const isShipmentModesOff = refundMode?.default_refund_mode === true;
  const isShipmentModesOn = refundMode?.default_refund_mode === false;

  // 3) Payment type for refund (PP vs COD)
  const isCODRefund =
    refundMode?.payment_identifiers?.includes("COD") ||
    shipmentDetails?.payment_info?.[0]?.payment_mode === "COD";

  const isPrepaidRefund = !isCODRefund;

  // for this page we *only* render total_refund when refund_modes.length !== 0,
  // so we don't handle "no refund_modes" UI here, only when they exist.

  // 4) When to show contact support in total_refund:
  //
  // - Platform refund config OFF  (is_refund_config_enabled: false)
  // - OR Platform config ON + shipment modes OFF + COD
  //   (matches your: OFF + COD → Contact Customer Care message)
  // - OR refund_mode is "settle_offline" (existing behaviour – keep this)
  const showContactSupportForTotalRefund =
    isPlatformConfigOff ||
    (isPlatformConfigOn && isShipmentModesOff && isCODRefund) ||
    refundMode?.refund_mode === "settle_offline";

  const breadcrumbItems = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.profile.profile"), link: "/profile/details" },
      { label: t("resource.common.my_orders"), link: "/profile/orders" },
      { label: "Order Details" },
    ],
    [t]
  );

  const handleAddToCart = async (productSlug) => {
    try {
      // Find the bag that matches the product slug
      const bag = shipmentDetails?.bags?.find(
        (bag) => bag?.item?.slug_key === productSlug
      );

      if (!bag) {
        showSnackbar(t("resource.common.add_cart_failure"), "error");
        return;
      }

      const itemId = bag?.item?.id;
      const itemSize = bag?.item?.size;
      const quantity = bag?.quantity || 1;
      const pincode = shipmentDetails?.delivery_address?.pincode || "";

      if (!itemId) {
        showSnackbar(t("resource.common.add_cart_failure"), "error");
        return;
      }

      // Fetch product price with fulfillment option to get required fields
      const priceResponse = await fpi.executeGQL(FULFILLMENT_OPTIONS, {
        slug: productSlug,
        size: itemSize || "",
        pincode: pincode,
      });

      const priceItems =
        priceResponse?.data?.productsPriceWithFulfillmentOption?.items;
      if (!priceItems || priceItems.length === 0) {
        showSnackbar(t("resource.common.add_cart_failure"), "error");
        return;
      }

      // Use the first available item (or find matching size if needed)
      const priceItem =
        priceItems.find((item) => item.quantity > 0) || priceItems[0];

      if (!priceItem) {
        showSnackbar(t("resource.common.add_cart_failure"), "error");
        return;
      }

      // Construct the payload with all required fields
      const payload = {
        buyNow: false,
        areaCode: pincode,
        addCartRequestInput: {
          items: [
            {
              article_assignment: {
                level: String(priceItem?.article_assignment?.level || ""),
                strategy: String(priceItem?.article_assignment?.strategy || ""),
              },
              article_id: String(priceItem?.article_id || ""),
              item_id: itemId,
              item_size: itemSize ? String(itemSize) : undefined,
              quantity: quantity,
              seller_id: priceItem?.seller?.uid,
              store_id: priceItem?.store?.uid,
              fulfillment_option_slug:
                priceItem?.fulfillment_option?.slug || "",
            },
          ],
        },
      };

      const outRes = await fpi.executeGQL(ADD_TO_CART, payload);

      if (outRes?.data?.addItemsToCart?.success) {
        fetchCartDetails(fpi);
        showSnackbar(
          translateDynamicLabel(outRes?.data?.addItemsToCart?.message, t) ||
            t("resource.common.add_to_cart_success"),
          "success"
        );
      } else {
        const errorMessage =
          translateDynamicLabel(outRes?.errors?.[0]?.message, t) ||
          translateDynamicLabel(outRes?.data?.addItemsToCart?.message, t) ||
          t("resource.common.add_cart_failure");
        showSnackbar(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showSnackbar(t("resource.common.add_cart_failure"), "error");
    }
  };
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="basePageContainer">
          <div className={styles.breadcrumbWrapper}>
            <Breadcrumb breadcrumb={breadcrumbItems} />
          </div>
          {showPolling && (
            <div className={`${styles.error}`}>
              <ShipmentPolling />
            </div>
          )}
          {!shipmentDetails && !showPolling && !isLoading && (
            <div className={`${styles.error}`}>
              <EmptyState
                title={t("resource.section.order.empty_state_title")}
                description={t("resource.section.order.empty_state_desc")}
                btnLink="/profile/orders"
                btnTitle={t("resource.section.order.emptybtn_title")}
              />
            </div>
          )}
          <div>
            {shipmentDetails && (
              <div className={`${styles.shipmentWrapper}`}>
                {blocks?.map((block, index) => {
                  const key = `${block.type}_${index}`;
                  switch (block.type) {
                    case "order_header":
                      return (
                        <>
                          <div className={`${styles.shipmentHeader}`} key={key}>
                            <div className="flexCenter">
                              <OrderDeliveryIcon />
                            </div>
                            <div className={styles.title}>
                              {shipmentDetails?.shipment_id}
                            </div>
                          </div>

                          {shipmentDetails?.shipment_status && (
                            <div className={styles.reattemptButtonCont}>
                              <div
                                className={
                                  shipmentDetails?.shipment_status?.value ===
                                  "cancelled"
                                    ? styles.cancelledStatus
                                    : shipmentDetails?.shipment_status
                                          ?.value === "return_processing"
                                      ? styles.pendingContainer
                                      : shipmentDetails?.shipment_status
                                            ?.value ===
                                          "delivery_attempt_failed"
                                        ? styles.errorStatus
                                        : shipmentDetails?.shipment_status
                                              ?.value ===
                                            "delivery_reattempt_requested"
                                          ? styles.info
                                          : styles.status
                                }
                              >
                                <span>
                                  {shipmentDetails?.shipment_status.title}
                                </span>
                              </div>

                              <div className={styles.buttonContainer}>
                                {shipmentDetails?.shipment_status?.value ===
                                  "delivery_attempt_failed" &&
                                  shipmentDetails?.ndr_details
                                    ?.allowed_delivery_window?.start_date &&
                                  shipmentDetails?.ndr_details
                                    ?.allowed_delivery_window?.end_date &&
                                  shipmentDetails?.ndr_details
                                    ?.show_ndr_form === true &&
                                  !ndrWindowExhausted() && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `/reattempt/shipment/${shipmentDetails?.shipment_id}`
                                        );
                                      }}
                                    >
                                      REQUEST REATTEMPT
                                    </button>
                                  )}

                                <div
                                  className={`${styles.requestReattempt} ${
                                    shipmentDetails?.shipment_status?.value ===
                                    "delivery_reattempt_requested"
                                      ? styles.deliveryReattemptRequested
                                      : ""
                                  }`}
                                >
                                  {shipmentDetails?.shipment_status?.value ===
                                    "delivery_reattempt_requested" && (
                                    <div
                                      className={styles.scheduleIconContainer}
                                    >
                                      <div className={styles.scheduleIcon}>
                                        <ScheduleIcon />
                                      </div>
                                      <div className={styles.scheduleIconText}>
                                        {shipmentDetails?.ndr_details
                                          ?.delivery_scheduled_date &&
                                          `Delivery Reattempt On ${formatUTCToDateString(
                                            shipmentDetails?.ndr_details
                                              ?.delivery_scheduled_date
                                          )}`}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      );

                    case "shipment_items":
                      return (
                        <React.Fragment key={key}>
                          <div className={`${styles.shipmentBagItem}`}>
                            {getSlicedGroupedShipmentBags()?.map(
                              (item, index) => (
                                <div
                                  key={item.item.brand.name + index}
                                  // className={
                                  //   !(item.can_cancel || item.can_return)
                                  //     ? `${styles.updateDisable}`
                                  //     : ""
                                  // }
                                >
                                  <ShipmentItem
                                    key={item.item.brand.name + index}
                                    bag={item}
                                    bundleGroups={bundleGroups}
                                    bundleGroupArticles={bundleGroupArticles}
                                    initial={initial}
                                    onChangeValue={onselectreason}
                                    shipment={{
                                      traking_no: shipmentDetails?.traking_no,
                                      track_url: shipmentDetails?.track_url,
                                    }}
                                    deliveryAddress={
                                      shipmentDetails?.delivery_address
                                    }
                                    selectId={selectId}
                                    type="my-orders"
                                    shipmentDetails={shipmentDetails}
                                    globalConfig={globalConfig}
                                  ></ShipmentItem>
                                </div>
                              )
                            )}
                          </div>
                          {shipmentBags?.length > 2 && (
                            <div>
                              {!show && (
                                <div
                                  className={`${styles.viewMore} `}
                                  onClick={showMore}
                                >
                                  {`+ ${shipmentBags?.length - 2} ${t("resource.facets.view_more_lower")}`}
                                </div>
                              )}
                              {show && (
                                <div
                                  className={`${styles.showLess} `}
                                  onClick={showLess}
                                >
                                  {t("resource.facets.view_less")}
                                </div>
                              )}
                            </div>
                          )}
                        </React.Fragment>
                      );

                    case "shipment_medias":
                      return (
                        !!shipmentDetails?.return_meta?.images?.length && (
                          <div className={styles.shipment} key={key}>
                            <div className={styles.mediaPreview}>
                              <div className={styles.previewTitle}>
                                {t("resource.order.uploaded_media")}
                              </div>
                              <ul className={styles.fileList}>
                                {shipmentDetails.return_meta.images.map(
                                  (file, index) => (
                                    <li key={index} className={styles.fileItem}>
                                      {isVideo(file.url) ? (
                                        <div className={styles.videoContainer}>
                                          <video
                                            className={styles.uploadedImage}
                                            src={file.url}
                                            preload="metadata"
                                            onClick={() => openMediaModal(file)}
                                            onError={(e) => {
                                              e.target.style.display = "none";
                                              const img =
                                                document.createElement("img");
                                              img.src = DefaultImage;
                                              img.className =
                                                styles.uploadedImage;
                                              img.style.cursor = "pointer";
                                              img.onclick = () =>
                                                openMediaModal(file);
                                              e.target.parentNode.appendChild(
                                                img
                                              );
                                            }}
                                            disablePictureInPicture
                                            aria-label={
                                              file.desc || `Video ${index + 1}`
                                            }
                                          >
                                            <source
                                              src={file.url}
                                              type="video/mp4"
                                            />
                                            <source
                                              src={file.url}
                                              type="video/webm"
                                            />
                                            <source
                                              src={file.url}
                                              type="video/ogg"
                                            />
                                          </video>
                                          <div className={styles.videoPlayIcon}>
                                            <svg
                                              width="40"
                                              height="40"
                                              viewBox="0 0 48 48"
                                              fill="none"
                                              className={styles.playIcon}
                                            >
                                              <circle
                                                cx="24"
                                                cy="24"
                                                r="24"
                                                fill="rgba(0,0,0,0.7)"
                                              />
                                              <path
                                                d="M18 12l18 12-18 12V12z"
                                                fill="white"
                                                transform="translate(-2, 0)"
                                              />
                                            </svg>
                                          </div>
                                        </div>
                                      ) : (
                                        <img
                                          className={styles.uploadedImage}
                                          src={file.url}
                                          alt={
                                            file.desc || `Image ${index + 1}`
                                          }
                                          onClick={() => openMediaModal(file)}
                                          onError={(e) => {
                                            e.target.src = DefaultImage;
                                          }}
                                          style={{ cursor: "pointer" }}
                                          loading="lazy"
                                        />
                                      )}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        )
                      );

                    case "shipment_tracking":
                      return (
                        initial && (
                          <div
                            className={`${styles.shipment} ${styles.shipmentTracking}`}
                            key={key}
                          >
                            <ShipmentTracking
                              tracking={shipmentDetails?.tracking_details}
                              shipmentInfo={shipmentDetails}
                              changeinit={toggelInit}
                              invoiceDetails={invoiceDetails}
                              bagLength={shipmentBags?.length}
                              availableFOCount={fulfillment_option?.count || 1}
                              onAddToCart={handleAddToCart}
                            ></ShipmentTracking>
                          </div>
                        )
                      );

                    case "shipment_address":
                      return (
                        initial && (
                          <div className={`${styles.shipment}`} key={key}>
                            <ShipmentAddress
                              address={shipmentDetails?.delivery_address}
                            ></ShipmentAddress>
                          </div>
                        )
                      );

                    case "payment_details_card":
                      return (
                        initial &&
                        shipmentDetails?.payment_info?.length > 0 && (
                          <div className={`${styles.shipment}`} key={key}>
                            <PaymentDetailCard
                              breakup={shipmentDetails?.breakup_values}
                              paymentDetails={shipmentDetails?.payment_info}
                            />
                          </div>
                        )
                      );

                    case "shipment_breakup":
                      return (
                        initial && (
                          <div
                            className={`${styles.shipment} ${styles.boxStyle}`}
                          >
                            <ShipmentBreakup
                              fpi={fpi}
                              breakup={shipmentDetails?.breakup_values}
                              shipmentInfo={shipmentDetails}
                              isHorizontalLine={true}
                              isAddPadding={false}
                              title={t(
                                "resource.refund_order.order_payment_summary"
                              )}
                            ></ShipmentBreakup>
                          </div>
                        )
                      );

                    case "total_refund":
                      return (
                        <>
                          {initial &&
                            shipmentDetails?.refund_modes?.length !== 0 &&
                            !isCODAndNoDeliveryDate && (
                              <div className={styles.refundModesContainer}>
                                <div className={styles.totalRefundContainer}>
                                  <RefundSummary
                                    refundBreakup={
                                      shipmentDetails?.refund_breakup_values
                                    }
                                    title={t(
                                      "resource.refund_order.refund_breakup"
                                    )}
                                    customClass={styles.deductionAmountFont}
                                    customTitleClass={styles.refundTitle}
                                    customSubTitleClass={styles.refundSubTitle}
                                    amountFontClass={styles.amountFontClass}
                                  />

                                  {showContactSupportForTotalRefund ? (
                                    <div
                                      className={styles.supportContactWrapper}
                                    >
                                      <ContacRefundSupport
                                        customClassName={
                                          styles.contactRefundSupport
                                        }
                                      />
                                    </div>
                                  ) : (
                                    // As per mode selection -> existing refund_modes UI
                                    shipmentDetails?.refund_modes?.map(
                                      (item, index) => (
                                        <div
                                          className={
                                            styles.multiRefundModeContainer
                                          }
                                          key={index}
                                        >
                                          {item.refund_mode ===
                                            "transfer_to_bank" &&
                                          item.beneficiary_details
                                            ?.account_no === null &&
                                          item?.beneficiary_details
                                            ?.vpa_address === null ? (
                                            <div
                                              className={
                                                styles.noInfoRefundDetailsContainer
                                              }
                                              key={index}
                                            >
                                              <div
                                                className={
                                                  styles.bankIconContainer
                                                }
                                              >
                                                <BankIcon />
                                              </div>

                                              <div
                                                className={
                                                  styles.beneficiaryDetailsMsg
                                                }
                                              >
                                                <span>
                                                  <span
                                                    className={
                                                      styles.headingText
                                                    }
                                                  >
                                                    ₹{item?.refund_amount}
                                                  </span>{" "}
                                                  {t(
                                                    isRefundCompleted(
                                                      item?.refund_status
                                                    )
                                                      ? "resource.refund_order.refund_has_been_credited_to_beneficiary_account_msg"
                                                      : "resource.refund_order.refund_will_credited_to_beneficiary_account_msg"
                                                  )}
                                                </span>

                                                {item?.refund_status
                                                  ?.operational_status !==
                                                  null && (
                                                  <div
                                                    className={
                                                      item?.refund_status
                                                        ?.status ===
                                                      "refund_completed"
                                                        ? styles.successContainer
                                                        : styles.pendingContainer
                                                    }
                                                  >
                                                    <span>
                                                      {
                                                        item?.refund_status
                                                          ?.operational_status
                                                      }
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ) : (
                                            <div
                                              className={
                                                styles.refundDetailsContainer
                                              }
                                              key={index}
                                            >
                                              <div
                                                className={
                                                  styles.userTransactionWrapper
                                                }
                                              >
                                                {includesIgnoreCase(
                                                  item?.display_name,
                                                  "store"
                                                ) && (
                                                  <div
                                                    className={
                                                      styles.iconContainer
                                                    }
                                                  >
                                                    <CreditStore />
                                                  </div>
                                                )}
                                                {includesIgnoreCase(
                                                  item?.display_name,
                                                  "bank"
                                                ) && (
                                                  <div
                                                    className={
                                                      styles.iconContainer
                                                    }
                                                  >
                                                    <BankIcon />
                                                  </div>
                                                )}
                                                {includesIgnoreCase(
                                                  item?.display_name,
                                                  "upi"
                                                ) && (
                                                  <div
                                                    className={
                                                      styles.iconContainer
                                                    }
                                                  >
                                                    <UpiIcon />
                                                  </div>
                                                )}
                                                {includesIgnoreCase(
                                                  item?.display_name,
                                                  "source"
                                                ) && (
                                                  <div
                                                    className={
                                                      styles.iconContainer
                                                    }
                                                  >
                                                    <RefundToSourceIcon />
                                                  </div>
                                                )}

                                                <div
                                                  className={
                                                    styles.transactionInfo
                                                  }
                                                >
                                                  {includesIgnoreCase(
                                                    item?.display_name,
                                                    "bank"
                                                  ) && (
                                                    <span>
                                                      <span
                                                        className={
                                                          styles.headingText
                                                        }
                                                      >
                                                        ₹{item?.refund_amount}
                                                      </span>
                                                      &nbsp;
                                                      {t(
                                                        isRefundCompleted(
                                                          item?.refund_status
                                                        )
                                                          ? "resource.refund_order.has_been_credited_to_this_bank_account_no"
                                                          : "resource.refund_order.will_be_credited_to_this_bank_account_no"
                                                      )}
                                                      &nbsp;
                                                      <span
                                                        className={
                                                          styles.headingText
                                                        }
                                                      >
                                                        {item?.beneficiary_details?.account_no?.slice(
                                                          -4
                                                        )}
                                                      </span>
                                                    </span>
                                                  )}

                                                  {includesIgnoreCase(
                                                    item?.display_name,
                                                    "store"
                                                  ) && (
                                                    <span>
                                                      <span
                                                        className={
                                                          styles.headingText
                                                        }
                                                      >
                                                        ₹{item?.refund_amount}
                                                      </span>
                                                      &nbsp;
                                                      {t(
                                                        isRefundCompleted(
                                                          item?.refund_status
                                                        )
                                                          ? "resource.refund_order.store_credits_has_been_added_to_your_account"
                                                          : "resource.refund_order.store_credits_will_be_added_to_your_account"
                                                      )}
                                                    </span>
                                                  )}

                                                  {includesIgnoreCase(
                                                    item?.display_name,
                                                    "upi"
                                                  ) && (
                                                    <span>
                                                      <span
                                                        className={
                                                          styles.headingText
                                                        }
                                                      >
                                                        ₹{item?.refund_amount}
                                                      </span>
                                                      &nbsp;
                                                      {t(
                                                        isRefundCompleted(
                                                          item?.refund_status
                                                        )
                                                          ? "resource.refund_order.has_been_credited_to_this_upi_id"
                                                          : "resource.refund_order.will_be_credited_to_this_upi_id"
                                                      )}
                                                      &nbsp;
                                                      <span
                                                        className={
                                                          styles.headingText
                                                        }
                                                      >
                                                        {
                                                          item
                                                            ?.beneficiary_details
                                                            ?.vpa_address
                                                        }
                                                      </span>
                                                    </span>
                                                  )}

                                                  {includesIgnoreCase(
                                                    item?.display_name,
                                                    "source"
                                                  ) && (
                                                    <span>
                                                      <span
                                                        className={
                                                          styles.headingText
                                                        }
                                                      >
                                                        ₹{item?.refund_amount}
                                                      </span>
                                                      &nbsp;
                                                      {t(
                                                        isRefundCompleted(
                                                          item?.refund_status
                                                        )
                                                          ? "resource.refund_order.has_been_refunded_to_your_original_payment_method"
                                                          : "resource.refund_order.will_be_refunded_to_your_original_payment_method"
                                                      )}
                                                    </span>
                                                  )}

                                                  {item?.refund_status
                                                    ?.status ===
                                                    "refund_completed" &&
                                                    item?.refund_status
                                                      ?.transaction_info
                                                      ?.length > 0 &&
                                                    item?.refund_status?.transaction_info.map(
                                                      (txn, idx) =>
                                                        txn?.utr?.trim() ? (
                                                          <h6
                                                            className={
                                                              styles.urtText
                                                            }
                                                            key={idx}
                                                          >
                                                            {t(
                                                              "resource.refund_order.utr"
                                                            )}{" "}
                                                            : {txn.utr}
                                                          </h6>
                                                        ) : null
                                                    )}
                                                </div>
                                              </div>

                                              <div
                                                className={
                                                  item?.refund_status
                                                    ?.status ===
                                                  "refund_completed"
                                                    ? styles.successContainer
                                                    : styles.pendingContainer
                                                }
                                              >
                                                <span>
                                                  {
                                                    item?.refund_status
                                                      ?.operational_status
                                                  }
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </>
                      );

                    case "extension-binding":
                      return <BlockRenderer block={block} key={key} />;

                    default:
                      return (
                        <h1 key={key}>{t("resource.common.invalid_block")}</h1>
                      );
                  }
                })}
              </div>
            )}
          </div>

          {!initial && (
            <div className={`${styles.btndiv}`}>
              <div className={`${styles.updateBtns}`}>
                <button
                  type="button"
                  className={`${styles.commonBtn} ${styles.cancelBtn}`}
                  onClick={() => setInitial(!initial)}
                >
                  {t("resource.facets.cancel")}
                </button>
                <button
                  type="button"
                  className={`${styles.commonBtn} ${styles.btn}`}
                  disabled={!btndisable}
                  onClick={goToReasons}
                >
                  {t("resource.common.continue")}
                </button>
              </div>
            </div>
          )}

          {/* Image/Video preview Modal */}
          {isMediaModalOpen && selectedMedia && (
            <Modal
              hideHeader={true}
              isOpen={isMediaModalOpen}
              closeDialog={closeMediaModal}
              bodyClassName={styles.mediaModalBody}
              containerClassName={styles.mediaModalContainer}
              modalType="center-modal"
            >
              <div className={styles.mediaModalContent}>
                <h4 className={styles.mediaModalTitle}>
                  {isVideo(selectedMedia.url)
                    ? t("resource.order.video_preview")
                    : t("resource.order.image_preview")}
                  <span onClick={closeMediaModal} className={styles.closeIcon}>
                    <CrossIcon />
                  </span>
                </h4>

                <div className={styles.mediaContent}>
                  {(() => {
                    if (mediaLoadError) {
                      return (
                        <div className={styles.mediaErrorContainer}>
                          <DefaultImage className={styles.modalImage} />
                        </div>
                      );
                    }
                    if (isVideo(selectedMedia.url)) {
                      return (
                        <video
                          className={styles.modalVideo}
                          src={selectedMedia.url}
                          controls
                          autoPlay
                          disablePictureInPicture
                          onError={handleMediaError}
                        >
                          <source src={selectedMedia.url} type="video/mp4" />
                          <source src={selectedMedia.url} type="video/webm" />
                          <source src={selectedMedia.url} type="video/ogg" />
                        </video>
                      );
                    }
                    return (
                      <div className={styles.imageContainer}>
                        <img
                          className={styles.modalImage}
                          src={selectedMedia.url}
                          alt={selectedMedia.desc || "image"}
                          onError={handleMediaError}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}
    </>
  );
}

export const settings = {
  label: "t:resource.sections.order_details.order_details",
  props: [],
  blocks: [
    {
      type: "order_header",
      name: "t:resource.sections.order_details.order_header",
      props: [],
    },
    {
      type: "shipment_items",
      name: "t:resource.sections.order_details.shipment_items",
      props: [],
    },
    {
      type: "shipment_medias",
      name: "t:resource.sections.order_details.shipment_medias",
      props: [],
    },
    {
      type: "shipment_medias",
      name: "Shipment Medias",
      props: [],
    },
    {
      type: "shipment_tracking",
      name: "t:resource.sections.order_details.shipment_tracking",
      props: [],
    },
    {
      type: "shipment_address",
      name: "t:resource.sections.order_details.shipment_address",
      props: [],
    },
    {
      type: "payment_details_card",
      name: "t:resource.sections.order_details.payment_details_card",
      props: [],
    },
    {
      type: "shipment_breakup",
      name: "t:resource.sections.order_details.shipment_breakup",
      props: [],
    },
    {
      type: "total_refund",
      name: "t:resource.sections.order_details.total_refund",
      props: [],
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.sections.order_details.order_header",
      },
      {
        name: "t:resource.sections.order_details.shipment_items",
      },
      {
        name: "t:resource.sections.order_details.shipment_medias",
      },
      {
        name: "t:resource.sections.order_details.shipment_tracking",
      },
      {
        name: "t:resource.sections.order_details.shipment_address",
      },
      {
        name: "t:resource.sections.order_details.payment_details_card",
      },
      {
        name: "t:resource.sections.order_details.shipment_breakup",
      },
      {
        name: "t:resource.sections.order_details.total_refund",
      },
    ],
  },
};

export default Component;
