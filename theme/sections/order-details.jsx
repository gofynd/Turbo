import React, { useState, useMemo, useEffect } from "react";
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
import styles from "../page-layouts/profile/styles/profile-my-order-shipment-page.less";
import useShipmentDetails from "../page-layouts/orders/useShipmentDetails";
import EmptyState from "../components/empty-state/empty-state";
import Loader from "../components/loader/loader";
import {
  useGlobalTranslation,
  useNavigate,
  useGlobalStore,
} from "fdk-core/utils";
import OrderDeliveryIcon from "../assets/images/order-delivery.svg";
import CrossIcon from "../assets/images/cross-black.svg";
import DefaultImage from "../assets/images/default-image.svg";

import "@gofynd/theme-template/components/core/modal/modal.css";

const Modal = React.lazy(
  () => import("@gofynd/theme-template/components/core/modal/modal")
);

export function Component({ blocks, fpi }) {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();
  const { fulfillment_option } = useGlobalStore(fpi.getters.APP_FEATURES);
  const { isLoading, shipmentDetails, invoiceDetails, getInvoice } =
    useShipmentDetails(fpi);
  const [initial, setInitial] = useState(true);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState("");
  const [goToLink, setGoToLink] = useState("");

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaLoadError, setMediaLoadError] = useState(false);

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

  const getBag = () => {
    return shipmentDetails?.bags;
  };

  const getSlicedGroupedShipmentBags = () => {
    return shipmentDetails?.bags?.slice(
      0,
      show ? shipmentDetails?.bags?.length : 1 * 2
    );
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

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="basePageContainer">
          {!shipmentDetails && (
            <div className={`${styles.error}`}>
              <EmptyState
                title={t("resource.section.order.empty_state_title")}
                description={t("resource.section.order.empty_state_desc")}
                btnLink="/profile/orders"
                btnTitle={t("resource.section.order.emptybtn_title")}
              ></EmptyState>
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
                        <div className={`${styles.shipmentHeader}`} key={key}>
                          <div className="flexCenter">
                            <OrderDeliveryIcon />
                          </div>
                          <div className={styles.title}>
                            {shipmentDetails?.shipment_id}
                          </div>
                          {shipmentDetails?.shipment_status && (
                            <div className={`${styles.status}`}>
                              {shipmentDetails?.shipment_status.title}
                            </div>
                          )}
                        </div>
                      );

                    case "shipment_items":
                      return (
                        <React.Fragment key={key}>
                          <div className={`${styles.shipmentBagItem}`}>
                            {getSlicedGroupedShipmentBags()?.map(
                              (item, index) => (
                                <div
                                  key={item.item.brand.name + index}
                                  className={
                                    !(item.can_cancel || item.can_return)
                                      ? `${styles.updateDisable}`
                                      : ""
                                  }
                                >
                                  <ShipmentItem
                                    key={item.item.brand.name + index}
                                    bag={item}
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
                                  ></ShipmentItem>
                                </div>
                              )
                            )}
                          </div>
                          {getBag()?.length > 2 && (
                            <div>
                              {!show && (
                                <div
                                  className={`${styles.viewMore} `}
                                  onClick={showMore}
                                >
                                  {`+ ${getBag().length - 2} ${t("resource.facets.view_more_lower")}`}
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
                              bagLength={getBag()?.length}
                              availableFOCount={fulfillment_option?.count || 1}
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
                          <div className={`${styles.shipment}`} key={key}>
                            <ShipmentBreakup
                              fpi={fpi}
                              breakup={shipmentDetails?.breakup_values}
                              shipmentInfo={shipmentDetails}
                            ></ShipmentBreakup>
                          </div>
                        )
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
                  {mediaLoadError ? (
                    <div className={styles.mediaErrorContainer}>
                      <DefaultImage className={styles.modalImage} />
                    </div>
                  ) : isVideo(selectedMedia.url) ? (
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
                  ) : (
                    <div className={styles.imageContainer}>
                      <img
                        className={styles.modalImage}
                        src={selectedMedia.url}
                        alt={selectedMedia.desc || "image"}
                        onError={handleMediaError}
                      />
                    </div>
                  )}
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
    ],
  },
};

export default Component;
