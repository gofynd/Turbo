import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGlobalStore, useNavigate } from "fdk-core/utils";
import { isLoggedIn } from "../helper/auth-guard";
import { useThemeConfig } from "../helper/hooks";
import ProfileRoot from "../components/profile/profile-root";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";

function Profile({ fpi }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};

  const rightSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "Profile"
  );

  useEffect(() => {
    if (pathname === "/profile") {
      navigate("/profile/details");
    }
  }, [pathname, navigate]);

  return (
    <ProfileRoot
      fpi={fpi}
      rightSections={rightSections}
      globalConfig={globalConfig}
    />
  );
}

Profile.authGuard = isLoggedIn;

export const sections = JSON.stringify([
  {
    canvas: {
      value: "Profile",
      label: "Profile Panel",
    },
    attributes: {
      page: "profile",
    },
    blocks: [
      {
        type: "profile-navigation-menu",
        name: "Profile Navigation Menu",
        props: [],
      },
    ],
    default: true,
  },
]);

export default Profile;
