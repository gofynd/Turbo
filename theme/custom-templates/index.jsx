import React from "react";
import { Route } from "react-router-dom";
import SiteMapCustom from "./sitemap";

export default [
  // <Route path="cart" element={<Cart></Cart>} />,
  // <Route path="profile" element={<Profile></Profile>} />,
  <Route
    path="site-map"
    element={<SiteMapCustom />}
    handle={{
      pageType: "c:::site-map",
    }}
  />,
];
