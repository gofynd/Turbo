import React, { useEffect, useRef } from "react";

export function Component({ props }) {
  const { code, padding_top, padding_bottom } = props;
  const sectionRef = useRef(null);

  const originalContent = typeof code?.value === "string" ? code.value : "";

  const styleMatches = [...originalContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  const extractedStyles = styleMatches.map((match) => match[1]);

  const scriptMatches = [...originalContent.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  const extractedScripts = scriptMatches.map((match) => match[1]);

  let cleanedContent = originalContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      extractedScripts.forEach((scriptContent) => {
        try {
          const script = document.createElement("script");
          script.type = "text/javascript";
          script.textContent = scriptContent;
          sectionRef.current?.appendChild(script);
        } catch (err) {
          console.error("Script injection failed:", err);
        }
      });
    }, 300); 

    return () => clearTimeout(timeout);
  }, [code?.value]);

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
      label: "t:resource.sections.categories.top_padding",
      default: 16,
      info: "t:resource.sections.categories.top_padding_for_section",
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.bottom_padding",
      default: 16,
      info: "t:resource.sections.categories.bottom_padding_for_section",
    },
  ],
  blocks: [],
};

export default Component;


