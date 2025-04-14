import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";

export const HTMLContent = React.forwardRef(({ content }, ref) => {
  const [safeContent, setSafeContent] = useState(content);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSafeContent(DOMPurify.sanitize(content));
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
