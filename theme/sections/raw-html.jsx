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
