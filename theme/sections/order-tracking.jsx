import React, { useState, useEffect, useRef } from "react";
import OrderTrack from "@gofynd/theme-template/pages/order/order-tracking";
import "@gofynd/theme-template/pages/order/order-tracking.css";
import instMob from "../assets/images/inst_mob.png";

export function Component() {
  return <OrderTrack instMob={instMob}></OrderTrack>;
}
export const settings = {
  label: "Order Tracking",
};
export default Component;
