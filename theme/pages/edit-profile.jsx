import React from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
// import { isLoggedIn } from "../helper/auth-guard";

function EditProfile({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  return (
    page?.value === "edit-profile" && (
      <SectionRenderer
        sections={sections}
        fpi={fpi}
        globalConfig={globalConfig}
      />
    )
  );
}

EditProfile.serverFetch = () => {};

// EditProfile.authGuard = isLoggedIn;

export const sections = JSON.stringify([
  {
    attributes: {
      page: "edit-profile",
    },
  },
]);

export default EditProfile;
