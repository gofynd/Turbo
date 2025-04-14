import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../helper/auth-guard";
import ProfileRoot from "../../components/profile/profile-root";

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
