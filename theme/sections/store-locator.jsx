import React from "react";
import { useFPI } from "fdk-core/utils";
import StoreLocatorPage from "../page-layouts/store-locator/store-locator-page";
import { getConfigFromProps } from "../helper/utils";

function Component({ props }) {
  const fpi = useFPI();
  const pageConfig = getConfigFromProps(props);

  return <StoreLocatorPage fpi={fpi} {...pageConfig} />;
}

export const settings = {
  label: "Store Locator",
  props: [
    {
      type: "text",
      id: "section_title",
      default: "Find a Store Near You",
      label: "Section Title",
    },
  ],
};

export default Component;
