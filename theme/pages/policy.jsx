import React from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import { HTMLContent } from "../page-layouts/marketing/HTMLContent";
import ScrollToTop from "../components/scroll-to-top/scroll-to-top";

function Policy() {
  const fpi = useFPI();
  const { policy } = useGlobalStore(fpi?.getters?.LEGAL_DATA);

  return (
    <div className="basePageContainer margin0auto policyPageContainer">
      <HTMLContent content={policy} />
      <ScrollToTop/>
    </div>
  );
}

export const sections = JSON.stringify([]);

export default Policy;
