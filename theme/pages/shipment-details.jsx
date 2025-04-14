import React from "react";
import OrderDetails from "../page-layouts/profile/profile-my-order-shipment-page";

const ShipmentDetails = ({ fpi }) => {
  return <OrderDetails fpi={fpi} />;
};

export const settings = JSON.stringify({
  props: [],
});

export const sections = JSON.stringify([
  {
    attributes: {
      page: "shipment-details",
    },
  },
]);

export default ShipmentDetails;
