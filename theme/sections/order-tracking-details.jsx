import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import { GET_SHIPMENT_DETAILS } from "../queries/shipmentQuery";
import useShipmentDetails from "../page-layouts/orders/useShipmentDetails";
import useOrdersListing from "../page-layouts/orders/useOrdersListing";
import OrderTrack from "@gofynd/theme-template/pages/order/order-tracking-details/order-tracking-details";
import "@gofynd/theme-template/pages/order/order-tracking-details/order-tracking-details.css";

export function Component({ fpi }) {
  const { isLoading, orderShipments, linkOrderDetails } = useOrdersListing(fpi);
  const { invoiceDetails } = useShipmentDetails(fpi);
  const params = useParams();
  const [selectedShipmentBag, setSelectedShipmentBag] =
    useState(orderShipments);
  const [isShipmentLoading, setIsShipmentLoading] = useState(false);

  const { fulfillment_option } = useGlobalStore(fpi.getters.APP_FEATURES);

  const getShipmentDetails = () => {
    if (params?.shipmentId) {
      setIsShipmentLoading(true);
      try {
        const values = {
          shipmentId: params.shipmentId || "",
        };
        fpi
          .executeGQL(GET_SHIPMENT_DETAILS, values)
          .then((res) => {
            if (res?.data?.shipment) {
              const data = res?.data?.shipment?.detail;
              setSelectedShipmentBag(data);
            }
          })
          .finally(() => {
            setIsShipmentLoading(false);
          });
      } catch (error) {
        console.log({ error });
        setIsShipmentLoading(false);
      }
    }
  };
  return (
    <OrderTrack
      invoiceDetails={invoiceDetails}
      isLoading={isLoading}
      orderShipments={orderShipments}
      getShipmentDetails={getShipmentDetails}
      selectedShipment={selectedShipmentBag}
      isShipmentLoading={isShipmentLoading}
      availableFOCount={fulfillment_option?.count || 1}
      linkOrderDetails={linkOrderDetails}
    ></OrderTrack>
  );
}
``;
export const settings = {
  label: "Order Tracking Details",
};

export default Component;
