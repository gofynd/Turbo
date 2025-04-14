import React from "react";
import { loginGuard } from "../helper/auth-guard";
import { useGlobalStore } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";

function Register({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  return (
    page?.value === "register" && (
      <SectionRenderer
        sections={sections}
        fpi={fpi}
        globalConfig={globalConfig}
      />
    )
  );
}

Register.authGuard = loginGuard;

export default Register;

export const sections = JSON.stringify([
  {
    attributes: {
      page: "register",
    },
  },
]);
