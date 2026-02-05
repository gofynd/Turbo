import React, { useMemo } from "react";
import { HTMLContent } from "../../page-layouts/marketing/HTMLContent";
import { useRichText } from "../../helper/hooks";

function LegalPagesTemplate({ markdown }) {
  // Normalize content to handle null/undefined
  const content = markdown || "";

  // Check if content is already HTML (contains HTML tags)
  const isHTML = useMemo(() => {
    return /<\/?(div|p|ul|li|table|h\d|br|span|section|article|style)[^>]*>/i.test(
      content
    );
  }, [content]);

  // Always call the hook (React rules), but only use it if not HTML
  const richTextContent = useRichText(content);

  // If it's HTML, use it directly; otherwise use the processed markdown
  const renderedContent = isHTML ? content : richTextContent;

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
