import React from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import LegalPagesTemplate from "../components/legal-doc-templates/legal-pages-template";

export function Component() {
  const fpi = useFPI();
  const { tnc } = useGlobalStore(fpi?.getters?.LEGAL_DATA);


  return <LegalPagesTemplate  markdown={tnc || ""} />;
}

export const settings = {
  label: "Terms & Conditions",
  props: [],
  blocks: [],
};

Component.serverFetch = () => {};

export default Component;
