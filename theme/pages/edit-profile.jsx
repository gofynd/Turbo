import React from "react";
// import { isLoggedIn } from "../helper/auth-guard";
import EditProfilePage from "../page-layouts/edit-profile/edit-profile-page";

function EditProfile({ fpi }) {
  return <EditProfilePage fpi={fpi} />;
}

EditProfile.serverFetch = () => {};

// EditProfile.authGuard = isLoggedIn;

export default EditProfile;
