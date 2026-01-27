import React from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import LegalPagesTemplate from "../components/legal-doc-templates/legal-pages-template";

export function Component({ props }) {
  const fpi = useFPI();
  const { shipping } = useGlobalStore(fpi?.getters?.LEGAL_DATA);

  return <LegalPagesTemplate  markdown={shipping || ""} />;
}

export const settings = {
  label: "Shipping Policy",
  props: [],
  blocks: [],
};

Component.serverFetch = () => {};

export default Component;
