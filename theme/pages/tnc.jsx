import React from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import { HTMLContent } from "../page-layouts/marketing/HTMLContent";
import ScrollToTop from "../components/scroll-to-top/scroll-to-top";

function Tnc() {
  const fpi = useFPI();
  const { tnc } = useGlobalStore(fpi?.getters?.LEGAL_DATA);

  return (
    <div className="policyPageContainer basePageContainer margin0auto">
      <HTMLContent content={tnc} />
      <ScrollToTop/>
    </div>
  );
}

export const sections = JSON.stringify([]);

export default Tnc;