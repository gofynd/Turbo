import React from "react";

export function Component({ props }) {
  const { code, padding_top, padding_bottom } = props;

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  return !code?.value ? null : (
    <section
      className="basePageContainer margin0auto"
      dangerouslySetInnerHTML={{ __html: code.value }}
      style={dynamicStyles}
    />
  );
}

export const settings = {
  label: "t:resource.sections.custom_html.custom_html",
  props: [
    {
      id: "code",
      label: "t:resource.sections.custom_html.your_code_here",
      type: "code",
      default: "",
      info: "t:resource.sections.custom_html.custom_html_code_editor",
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
