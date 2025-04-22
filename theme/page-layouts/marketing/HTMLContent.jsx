import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";

export const HTMLContent = React.forwardRef(({ content }, ref) => {
  const [safeContent, setSafeContent] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const formattedContent =
        typeof content === "string" ? content.replace(/\n/g, "<br />") : content;

      const sanitized = DOMPurify.sanitize(formattedContent);
      setSafeContent(sanitized);
    }
  }, [content]);

  return (
    <div
      data-testid="html-content"
      ref={ref}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
});
