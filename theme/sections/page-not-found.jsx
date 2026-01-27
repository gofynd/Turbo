import React from "react";
import { useFPI, useGlobalTranslation } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";
import { getConfigFromProps } from "../helper/utils";
import PageNotFoundIcon from "../assets/images/not-found.svg";
import styles from "../components/page-not-found/page-not-found.less";

export function Component({ props, blocks, globalConfig, id: sectionId }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");

  const pageConfig = getConfigFromProps(props);

  const heading = pageConfig?.heading || t("resource.common.not_found_error");
  const message = pageConfig?.message || t("resource.common.not_found_message");
  const buttonText =
    pageConfig?.button_text || t("resource.common.return_home");

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.container}>
        <PageNotFoundIcon />
        <h3 className={`${styles.fontHeader} ${styles.title}`}>{heading}</h3>
        {message && <p className={styles.message}>{message}</p>}
        <FDKLink to="/">
          <FyButton
            className={styles.btnPrimary}
            variant="outlined"
            size="large"
            color="secondary"
            fullWidth={true}
          >
            {buttonText}
          </FyButton>
        </FDKLink>
      </div>
    </div>
  );
}

export default Component;

export const settings = {
  label: "Page Not Found",
  props: [
    {
      type: "text",
      id: "heading",
      label: "Heading",
      default: "Page Not Found",
      info: "Main heading text for the 404 page",
    },
    {
      type: "textarea",
      id: "message",
      label: "Message",
      default: "The page you are looking for does not exist.",
      info: "Description message for the 404 page",
    },
    {
      type: "text",
      id: "button_text",
      label: "Button Text",
      default: "Return to Home",
      info: "Text for the return home button",
    },
  ],
  blocks: [],
  preset: {
    blocks: [],
  },
};
