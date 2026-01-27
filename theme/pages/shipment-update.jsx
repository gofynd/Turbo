import React from "react";
import ProfileShipmentUpdatePage from "../page-layouts/profile/profile-shipment-update-page";

const ShipmentUpdate = ({ fpi }) => {
  return <ProfileShipmentUpdatePage fpi={fpi} />;
};

export const settings = JSON.stringify({
  props: [],
});

export const sections = JSON.stringify([
  {
    canvas: {
      value: "right_side",
      label: "Right Panel",
    },
    attributes: {
      page: "shipment-update",
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

export default ShipmentUpdate;
