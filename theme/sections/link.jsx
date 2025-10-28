import React, { useState, useEffect, useCallback } from "react";
import { FDKLink } from "fdk-core/components";

export function Component({ props, globalConfig }) {
  const { label, url, target } = props;
  const getPaddingByWidth = (width) => {
    if (width <= 425) return "16px";
    if (width > 425 && width < 1024) return "16px 24px";
    return "16px 40px";
  };
  const [padding, setPadding] = useState(() =>
    getPaddingByWidth(window.innerWidth)
  );
  const handleResize = useCallback(() => {
    setPadding(getPaddingByWidth(window.innerWidth));
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const style = { display: "block", padding };

  return target.value === "_blank" ? (
    <a href={url.value} target={target.value} style={style}>
      {label.value}
    </a>
  ) : (
    <FDKLink to={url.value} style={style}>
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
