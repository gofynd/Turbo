import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BlockRenderer } from "fdk-core/components";
import OrdersHeader from "@gofynd/theme-template/components/order-header/order-header";
import "@gofynd/theme-template/components/order-header/order-header.css";
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
import OrderDeliveryIcon from "../assets/images/order-delivery.svg";

export function Component({ blocks, fpi }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, shipmentDetails, invoiceDetails, getInvoice } =
    useShipmentDetails(fpi);
  const [initial, setInitial] = useState(true);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState("");
  const [goToLink, setGoToLink] = useState("");

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
      navigate({
        pathname: goToLink,
        search: querParams.toString(),
      });
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

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="basePageContainer">
          {!shipmentDetails && (
            <div className={`${styles.error}`}>
              <EmptyState
                title="Shipment details not found."
                description="Shipment details are not available. This section might be misplaced and ideally should be on the shipment details page where a shipment ID is provided, or the data might not be found."
                btnLink="/profile/orders"
                btnTitle="RETURN TO ORDER PAGE"
              ></EmptyState>
            </div>
          )}
          <div>
            {shipmentDetails && (
              <div className={`${styles.shipmentWrapper}`}>
                {blocks &&
                  blocks.map((block) => {
                    switch (block.type) {
                      case "order_header":
                        return (
                          <div className={`${styles.shipmentHeader}`}>
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
                          <>
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
                                    {`+ ${getBag().length - 2} view more`}
                                  </div>
                                )}
                                {show && (
                                  <div
                                    className={`${styles.showLess} `}
                                    onClick={showLess}
                                  >
                                    view less
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        );

                      case "shipment_medias":
                        return (
                          <>
                            {!!shipmentDetails?.return_meta?.images?.length && (
                              <div className={styles.shipment}>
                                <div className={styles.mediaPreview}>
                                  <div className={styles.previewTitle}>
                                    Uploaded Photos/Videos
                                  </div>
                                  <ul className={styles.fileList}>
                                    {shipmentDetails.return_meta.images.map(
                                      (file, index) => (
                                        <li
                                          key={index}
                                          className={styles.fileItem}
                                        >
                                          {isVideo(file.url) ? (
                                            <video
                                              className={styles.uploadedImage}
                                              src={file.url}
                                            />
                                          ) : (
                                            <img
                                              className={styles.uploadedImage}
                                              src={file.url}
                                              alt={file.desc}
                                            />
                                          )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      case "shipment_tracking":
                        return (
                          <>
                            {initial && (
                              <div className={`${styles.shipment} ${styles.shipmentTracking}`}>
                                <ShipmentTracking
                                  tracking={shipmentDetails?.tracking_details}
                                  shipmentInfo={shipmentDetails}
                                  changeinit={toggelInit}
                                  invoiceDetails={invoiceDetails}
                                ></ShipmentTracking>
                              </div>
                            )}
                          </>
                        );

                      case "shipment_address":
                        return (
                          <>
                            {initial && (
                              <div className={`${styles.shipment}`}>
                                <ShipmentAddress
                                  address={shipmentDetails?.delivery_address}
                                ></ShipmentAddress>
                              </div>
                            )}
                          </>
                        );

                      case "payment_details_card":
                        return (
                          <>
                            {initial &&
                              shipmentDetails?.payment_info?.length > 0 && (
                                <div className={`${styles.shipment}`}>
                                  <PaymentDetailCard
                                    breakup={shipmentDetails?.breakup_values}
                                    paymentDetails={
                                      shipmentDetails?.payment_info
                                    }
                                  />
                                </div>
                              )}
                          </>
                        );

                      case "shipment_breakup":
                        return (
                          <>
                            {initial && (
                              <div className={`${styles.shipment}`}>
                                <ShipmentBreakup
                                  fpi={fpi}
                                  breakup={shipmentDetails?.breakup_values}
                                  shipmentInfo={shipmentDetails}
                                ></ShipmentBreakup>
                              </div>
                            )}
                          </>
                        );

                      case "extension-binding":
                        return <BlockRenderer block={block} />;

                      default:
                        return <h1>Invalid block</h1>;
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
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.commonBtn} ${styles.btn}`}
                  disabled={!btndisable}
                  onClick={goToReasons}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export const settings = {
  label: "Order Details",
  props: [],
  blocks: [
    {
      type: "order_header",
      name: "Order Header",
      props: [],
    },
    {
      type: "shipment_items",
      name: "Shipment Items",
      props: [],
    },
    {
      type: "shipment_medias",
      name: "Shipment Medias",
      props: [],
    },
    {
      type: "shipment_tracking",
      name: "Shipment Tracking",
      props: [],
    },
    {
      type: "shipment_address",
      name: "Shipment Address",
      props: [],
    },
    {
      type: "payment_details_card",
      name: "Payment Details Card",
      props: [],
    },
    {
      type: "shipment_breakup",
      name: "Shipment Breakup",
      props: [],
    },
  ],
  preset: {
    blocks: [
      {
        name: "Order Header",
      },
      {
        name: "Shipment Items",
      },
      {
        name: "Shipment Medias",
      },
      {
        name: "Shipment Tracking",
      },
      {
        name: "Shipment Address",
      },
      {
        name: "Payment Details Card",
      },
      {
        name: "Shipment Breakup",
      },
    ],
  },
};
export default Component;
