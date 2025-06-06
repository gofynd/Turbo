import React from "react";

export const HTMLContent = React.forwardRef(({ content }, ref) => {
  const originalContent = typeof content === "string" ? content : "";

  const styleMatches = [
    ...originalContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi),
  ];
  const extractedStyles = styleMatches.map((match) => match[1]);

  let cleanedContent = originalContent.replace(
    /<style[^>]*>[\s\S]*?<\/style>/gi,
    ""
  );

  const hasHTMLTags =
    /<\/?(div|p|ul|li|table|h\d|br|span|section|article)[^>]*>/i.test(
      cleanedContent
    );
  if (!hasHTMLTags) {
    cleanedContent = cleanedContent.replace(/\n/g, "<br />");
  }

  return (
    <div ref={ref} className="cms-html-wrapper">
      {/* Inject <style> blocks */}
      {extractedStyles.map((css, index) => (
        <style key={index} dangerouslySetInnerHTML={{ __html: css }} />
      ))}

      {/* Render processed HTML */}
      <div
        data-testid="html-content"
        dangerouslySetInnerHTML={{ __html: cleanedContent }}
      />
    </div>
  );
});
