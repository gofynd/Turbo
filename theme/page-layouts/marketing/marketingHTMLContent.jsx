import React, { useEffect, useState } from "react";

const stripScripts = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;

  const scripts = div.getElementsByTagName("script");
  for (let i = scripts.length - 1; i >= 0; i--) {
    scripts[i].parentNode.removeChild(scripts[i]);
  }

  return div.innerHTML;
};

export const HTMLContent = React.forwardRef(({ content }, ref) => {
  const [safeContent, setSafeContent] = useState(content);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const clean = stripScripts(content);
      setSafeContent(clean);
    }
  }, [content]);

  return (
    <div
      ref={ref}
      data-testid="html-content"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
});
