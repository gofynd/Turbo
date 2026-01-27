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
    canvas: {
      value: "left_side",
      label: "Left Panel",
    },
    attributes: {
      page: "shipment-details",
    },
  },
  {
    canvas: {
      value: "right_side",
      label: "Right Panel",
    },
    attributes: {
      page: "shipment-details",
    },
    blocks: [
      {
        type: "profile-navigation-menu",
        name: "Profile Navigation Menu",
        props: [],
      },
    ],
  },
]);

export default ShipmentDetails;
