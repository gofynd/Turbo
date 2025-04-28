import React from "react";
import { FDKLink } from "fdk-core/components";

export function Component({ props, globalConfig }) {
  const { label, url, target } = props;
  return target.value === "_blank" ? (
    <a
      href={url.value}
      target={target.value}
      style={{
        display: "block",
        paddingTop: "16px",
        paddingBottom: `16px`,
      }}
    >
      {label.value}
    </a>
  ) : (
    <FDKLink
      to={url.value}
      style={{
        display: "block",
        paddingTop: "16px",
        paddingBottom: `16px`,
      }}
    >
      {label.value}
    </FDKLink>
  );
}

export const settings = {
  label: "Link",
  props: [
    {
      id: "label",
      label: "t:resource.sections.link.link_label",
      type: "text",
      default: "t:resource.default_values.link_label",
      info: "t:resource.sections.link.link_label_info",
    },
    {
      id: "url",
      label: "t:resource.sections.link.url",
      type: "text",
      default: "t:resource.default_values.link_url",
      info: "t:resource.sections.link.url_for_link",
    },
    {
      id: "target",
      label: "t:resource.sections.link.link_target",
      type: "text",
      default: "",
      info: "t:resource.sections.link.html_target",
    },
  ],
  blocks: [],
};
export default Component;
