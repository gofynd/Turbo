import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isLoggedIn } from "../../helper/auth-guard";
import ProfileRoot from "../../components/profile/profile-root";
import { useNavigate } from "fdk-core/utils";

function ProfileTabs({ fpi }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname === "/profile") {
      navigate("details");
    }
  }, [pathname]);

  return <ProfileRoot fpi={fpi}></ProfileRoot>;
}

ProfileTabs.authGuard = isLoggedIn;

export default ProfileTabs;
