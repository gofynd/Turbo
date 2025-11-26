import React from "react";
import { Route } from "react-router-dom";
import SiteMap from "../components/site-map/site-map";

export default [
  // <Route path="cart" element={<Cart></Cart>} />,
  // <Route path="profile" element={<Profile></Profile>} />,
  <Route
    path="site-map"
    element={<SiteMap />}
    handle={{
      pageType: "c:::site-map",
    }}
  />,
];
