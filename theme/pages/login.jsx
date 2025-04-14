import React from "react";
import { loginGuard } from "../helper/auth-guard";
import { useGlobalStore } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";

function Login({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  return (
    page?.value === "login" && (
      <SectionRenderer
        sections={sections}
        fpi={fpi}
        globalConfig={globalConfig}
      />
    )
  );
}

Login.serverFetch = () => {};

Login.authGuard = loginGuard;

export const sections = JSON.stringify([
  {
    attributes: {
      page: "login",
    },
  },
]);

export default Login;
