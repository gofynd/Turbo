import React from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useAccounts } from "../../helper/hooks";
import ProfileNavigation from "@gofynd/theme-template/components/profile-navigation/profile-navigation";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";

function ProfileRoot({ children, fpi }) {
  const { first_name, last_name, profile_pic_url, user } = useGlobalStore(
    fpi.getters.USER_DATA
  );
  const { signOut } = useAccounts({ fpi });

  const userName =
    `${first_name ?? user?.first_name ?? ""} ${last_name ?? user?.last_name ?? ""}`.trim();

  const userProfilePicUrl = profile_pic_url ?? user?.profile_pic_url;

  return (
    <ProfileNavigation
      userName={userName}
      signOut={signOut}
      userProfilePicUrl={userProfilePicUrl}
    >
      {children}
    </ProfileNavigation>
  );
}

export default ProfileRoot;
