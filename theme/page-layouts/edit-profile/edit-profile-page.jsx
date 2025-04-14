import React from "react";
import EditProfile from "@gofynd/theme-template/pages/edit-profile/edit-profile";
import "@gofynd/theme-template/pages/edit-profile/edit-profile.css";
import useEditProfile from "./useEditProfile";
import styles from "./edit-profile-page.less";
import AuthContainer from "../auth/auth-container/auth-container";

function EditProfilePage({ fpi }) {
  const editProfileProps = useEditProfile(fpi);

  return (
    <AuthContainer>
      <EditProfile {...editProfileProps} />
      {/* <EditProfile /> */}
    </AuthContainer>
  );
}

export default EditProfilePage;
