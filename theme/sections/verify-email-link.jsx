import React from "react";
import { useFPI } from "fdk-core/utils";
import VerifyEmailLinkPage from "../page-layouts/verify-email-link/verify-email-link-page";
import { getConfigFromProps } from "../helper/utils";

export function Component({ props }) {
  const fpi = useFPI();
  const pageConfig = getConfigFromProps(props);

  return <VerifyEmailLinkPage fpi={fpi} pageConfig={pageConfig} />;
}

export default Component;

export const settings = {
  label: "Verify Email Link",
  props: [],
  blocks: [],
  preset: {},
};

