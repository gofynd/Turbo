import React, { useMemo } from "react";
import { parse } from "marked";

import { HTMLContent } from "./HTMLContent";

export function MarkdownRenderer({ content }) {
  const html = useMemo(
    () =>
      parse(content, {
        mangle: false,
        headerIds: false,
      }),
    [content]
  );
  // eslint-disable-next-line react/no-danger
  return <HTMLContent content={html} />;
}
