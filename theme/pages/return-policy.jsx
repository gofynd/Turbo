import React from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import { HTMLContent } from "../page-layouts/marketing/HTMLContent";

function ReturnPolicy() {
  const fpi = useFPI();
  const { returns } = useGlobalStore(fpi?.getters?.LEGAL_DATA);

  return (
    <div className="basePageContainer margin0auto policyPageContainer">
      <HTMLContent content={returns} />
    </div>
  );
}

export const sections = JSON.stringify([]);

export default ReturnPolicy;
