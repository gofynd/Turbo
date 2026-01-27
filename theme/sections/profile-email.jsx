import React, { useCallback, useMemo } from "react";
import { useFPI } from "fdk-core/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import { useEmail } from "../page-layouts/profile/useEmail";
import { useSnackbar } from "../helper/hooks";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import EmailPage from "@gofynd/theme-template/pages/profile/email";
import "@gofynd/theme-template/pages/profile/email/email.css";
import styles from "../styles/canvas-profile.less";

export function Component({ props, blocks, preset, globalConfig }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
  const { showSnackbar } = useSnackbar();

  const {
    sendVerificationLinkToEmail,
    setEmailAsPrimary,
    addEmail,
    deleteEmail,
    emails,
  } = useEmail({
    fpi,
  });

  // Destructure props with defaults
  const { title = "Email Address" } = Object.fromEntries(
    Object.entries(props || {}).map(([key, obj]) => [key, obj?.value])
  );

  const handleVerification = useCallback(
    async (email) => {
      try {
        await sendVerificationLinkToEmail(email);
        showSnackbar(
          `${t("resource.profile.verification_link_sent_to")} ${email}`,
          "success"
        );
      } catch (error) {
        showSnackbar(error?.message, "error");
        throw error;
      }
    },
    [sendVerificationLinkToEmail, showSnackbar, t]
  );

  const handleSetPrimary = useCallback(
    async (email) => {
      try {
        await setEmailAsPrimary(email);
        showSnackbar(
          `${email} ${t("resource.profile.set_as_primary")}`,
          "success"
        );
      } catch (error) {
        showSnackbar(error?.message, "error");
        throw error;
      }
    },
    [setEmailAsPrimary, showSnackbar, t]
  );

  const handleDelete = useCallback(
    async (emailDetails) => {
      try {
        await deleteEmail(emailDetails);
        showSnackbar(
          `${emailDetails?.email} ${t("resource.common.removed_success")}`,
          "success"
        );
      } catch (error) {
        showSnackbar(error?.message, "error");
        throw error;
      }
    },
    [deleteEmail, showSnackbar, t]
  );

  const handleAddEmail = useCallback(
    async (email) => {
      try {
        await addEmail(email);
        showSnackbar(
          `${t("resource.profile.set_as_primary")} ${email}`,
          "success"
        );
      } catch (error) {
        showSnackbar(error?.message, "error");
        throw error;
      }
    },
    [addEmail, showSnackbar, t]
  );

  const emailList = useMemo(
    () =>
      emails?.length === 1 ? emails : emails?.filter((item) => item?.primary),
    [emails]
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.profile.profile"), link: "/profile/details" },
      { label: t("resource.common.email_address") },
    ],
    [t]
  );

  return (
    <div className={styles.canvasSection}>
      <div className={styles.breadcrumbWrapper}>
        <Breadcrumb breadcrumb={breadcrumbItems} />
      </div>
      <h1 className={styles.sectionTitle}>{title}</h1>
      <EmailPage
        sendVerificationLinkToEmail={handleVerification}
        setEmailAsPrimary={handleSetPrimary}
        addEmail={handleAddEmail}
        deleteEmail={handleDelete}
        emails={emailList}
      />
    </div>
  );
}

export const settings = {
  label: "Profile Email",
  props: [
    {
      type: "text",
      id: "title",
      label: "Section Title",
      default: "Email Address",
    },
  ],
};

export default Component;
