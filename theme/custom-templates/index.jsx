import React from "react";
import { Route } from "react-router-dom";
import { useFPI } from "fdk-core/utils";
import SiteMapTemplate from "./sitemap";
import ProfileLoyaltyRewards from "../pages/profile-loyalty-rewards";

function ProfileLoyaltyRewardsCustom() {
  const fpi = useFPI();
  return <ProfileLoyaltyRewards fpi={fpi} forceRender />;
}

export default [
  // <Route path="cart" element={<Cart></Cart>} />,
  // <Route path="profile" element={<Profile></Profile>} />,
  <Route
    path="profile/loyalty-rewards"
    element={<ProfileLoyaltyRewardsCustom />}
    handle={{
      pageType: "profile-loyalty-rewards",
    }}
  />,
  <Route
    path="site-map"
    element={<SiteMapTemplate />}
    handle={{
      pageType: "c:::site-map",
    }}
  />,
];
