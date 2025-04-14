import React from "react";
import { useNavigate } from "react-router-dom";
import ProfileDetails from "@gofynd/theme-template/pages/profile";
import "@gofynd/theme-template/pages/profile/profile-details.css";
import { useGlobalStore } from "fdk-core/utils";
import { useAccounts, useSnackbar, useWindowWidth } from "../../helper/hooks";

function ProfileDetailsPage({ fpi }) {
  const windowWidth = useWindowWidth();
  const navigate = useNavigate();
  const { first_name, last_name, gender, user } = useGlobalStore(
    fpi.getters.USER_DATA
  );

  const userData = {
    firstName: first_name ?? user?.first_name,
    lastName: last_name ?? user?.last_name,
    gender: gender ?? user?.gender,
  };

  const { updateProfile } = useAccounts({ fpi });

  const { showSnackbar } = useSnackbar();

  const handleSave = async ({ firstName, lastName, gender }) => {
    try {
      await updateProfile({
        firstName,
        lastName,
        gender,
      });
      if (windowWidth <= 768) {
        navigate("/profile/profile-tabs");
      }

      showSnackbar("Updated Successfully", "success", "top-center");
    } catch (error) {
      showSnackbar(error?.message, "error");
    }
  };

  return <ProfileDetails handleSave={handleSave} userData={userData} />;
}

export default ProfileDetailsPage;
