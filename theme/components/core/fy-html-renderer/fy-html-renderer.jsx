import React, { useCallback, useEffect, useState } from "react";
import parse from "html-react-parser";
import { isRunningOnClient } from "../../../helper/utils";

const FyHTMLRenderer = ({ htmlContent, customClass, showDots = false }) => {
  const [newContent, setNewContent] = useState(htmlContent);
  useEffect(() => {
    if (htmlContent && showDots) {
      setNewContent((pre) => {
        return String(htmlContent).concat("...");
      });
    }
  }, [htmlContent]);
  return (
    <div className={customClass}>
      {isRunningOnClient() ? parse(newContent) : null}
    </div>
  );
};

export default FyHTMLRenderer;
