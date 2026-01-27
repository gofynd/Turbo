import React from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import LegalPagesTemplate from "../components/legal-doc-templates/legal-pages-template";

export function Component() {
  const fpi = useFPI();
  const { policy } = useGlobalStore(fpi?.getters?.LEGAL_DATA);
  

  return <LegalPagesTemplate  markdown={policy || ""} />;
}

export const settings = {
  label: "Privacy Policy",
  props: [],
  blocks: [],
};

Component.serverFetch = () => {};

export default Component;
