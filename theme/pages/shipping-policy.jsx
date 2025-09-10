import React from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import { HTMLContent } from "../page-layouts/marketing/HTMLContent";
import ScrollToTop from "../components/scroll-to-top/scroll-to-top";

function ShippingPolicy() {
  const fpi = useFPI();
  const { shipping } = useGlobalStore(fpi?.getters?.LEGAL_DATA);

  return (
    <div className="basePageContainer margin0auto policyPageContainer">
      <HTMLContent content={shipping} />
      <ScrollToTop/>
    </div>
  );
}

export const sections = JSON.stringify([]);

export default ShippingPolicy;


