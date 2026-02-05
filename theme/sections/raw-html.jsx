import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Simple hash function to generate unique identifiers for script content
const generateScriptHash = (content) => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash * 31 + content.charCodeAt(i)) % 2147483647;
  }
  return `raw-html-script-${Math.abs(hash).toString(16)}`;
};

export function Component({ props }) {
  const { code, padding_top, padding_bottom } = props;
  const sectionRef = useRef(null);
  const location = useLocation(); // detect SPA route changes

  const originalContent = typeof code?.value === "string" ? code.value : "";

  const styleMatches = [...originalContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  const extractedStyles = styleMatches.map((match) => match[1]);

  const scriptMatches = [...originalContent.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  const extractedInlineScripts = scriptMatches.map((match) => match[1]);

  const externalScriptMatches = [...originalContent.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/gi)];
  const externalScripts = externalScriptMatches.map((match) => match[1]);

  const linkMatches = [...originalContent.matchAll(/<link[^>]*rel="[^"]*"[^>]*href="([^"]+)"[^>]*>/gi)];
  const externalLinks = linkMatches.map((match) => {
    const hrefMatch = match[0].match(/href="([^"]+)"/);
    const relMatch = match[0].match(/rel="([^"]+)"/);
    const asMatch = match[0].match(/as="([^"]+)"/);
    return {
      href: hrefMatch?.[1],
      rel: relMatch?.[1],
      as: asMatch?.[1],
    };
  });

  let cleanedContent = originalContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/gi, "")
    .replace(/<link[^>]*href="[^"]+"[^>]*>/gi, "");

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  useEffect(() => {
    const cleanupElements = [];

    // Inject inline scripts (with deduplication to prevent redeclaration errors)
    extractedInlineScripts.forEach((scriptContent) => {
      const scriptId = generateScriptHash(scriptContent);
      // Skip if this script has already been injected
      if (document.querySelector(`script[data-raw-html-id="${scriptId}"]`)) return;
      
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.setAttribute("data-raw-html-id", scriptId);
      script.textContent = scriptContent;
      sectionRef.current?.appendChild(script);
      cleanupElements.push(script);
    });

    // Inject external scripts
    externalScripts.forEach((src) => {
      if (document.querySelector(`script[src="${src}"]`)) return;
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      cleanupElements.push(script);
    });

    // Inject external links (e.g., fonts or stylesheets)
    externalLinks.forEach(({ href, rel, as }) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement("link");
      link.href = href;
      link.rel = rel || "stylesheet";
      if (as) link.as = as;
      document.head.appendChild(link);
      cleanupElements.push(link);
    });

    return () => {
      // Clean up on unmount
      cleanupElements.forEach((el) => el.remove());
    };
  }, [code?.value, location.pathname]);

  return !code?.value ? null : (
    <section
      ref={sectionRef}
      className="basePageContainer margin0auto"
      style={dynamicStyles}
    >
      {extractedStyles.map((css, index) => (
        <style key={`style-${index}`} dangerouslySetInnerHTML={{ __html: css }} />
      ))}

      <div
        data-testid="html-content"
        dangerouslySetInnerHTML={{ __html: cleanedContent }}
      />
    </section>
  );
}

export const settings = {
  label: "t:resource.sections.raw_html.custom_html",
  props: [
    {
      id: "code",
      label: "t:resource.sections.raw_html.your_code_here",
      type: "code",
      default: "",
      info: "t:resource.sections.raw_html.custom_html_code_editor",
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Top padding",
      default: 16,
      info: "Top padding for section",
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Bottom padding",
      default: 16,
      info: "Bottom padding for section",
    },
  ],
  blocks: [],
};

export default Component;
