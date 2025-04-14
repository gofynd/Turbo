import React from "react";
import { useGlobalStore } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";
import ProfileRoot from "../../components/profile/profile-root";

function ProfileMyOrderShipmentPage({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );

  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  return (
    <ProfileRoot fpi={fpi}>
      {page?.value === "shipment-details" && (
        <SectionRenderer
          sections={sections}
          fpi={fpi}
          globalConfig={globalConfig}
        />
      )}
    </ProfileRoot>
  );
}

export default ProfileMyOrderShipmentPage;
