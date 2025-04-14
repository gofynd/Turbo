import React from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import { HTMLContent } from "../page-layouts/marketing/HTMLContent";

function Tnc() {
  const fpi = useFPI();
  const { tnc } = useGlobalStore(fpi?.getters?.LEGAL_DATA);

  return (
    <div className="policyPageContainer basePageContainer margin0auto">
      <HTMLContent content={tnc} />
    </div>
  );
}

export const sections = JSON.stringify([]);

export default Tnc;
