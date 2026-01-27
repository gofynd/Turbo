import React from "react";
import { HTMLContent } from "../../page-layouts/marketing/HTMLContent";
import { useRichText } from "../../helper/hooks";

function LegalPagesTemplate({ markdown }) {
  const renderedContent = useRichText(markdown || "");

  if (!renderedContent) return null;

  return (
    <section className="policyPageContainer basePageContainer margin0auto">
      {renderedContent ? (
        <HTMLContent content={renderedContent} className="policy-content" />
      ) : null}
    </section>
  );
}

export default LegalPagesTemplate;
