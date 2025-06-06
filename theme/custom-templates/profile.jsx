import React from "react";
import { useGlobalTranslation } from "fdk-core/utils";

function Profile() {
  const { t } = useGlobalTranslation("translation");
  return (
    <>
      <h1 style={{ color: "red" }}>
        {t("resource.profile.profile_page_description")}
      </h1>
      <hr />
    </>
  );
}

Profile.serverFetch = () => { };

export default Profile;
