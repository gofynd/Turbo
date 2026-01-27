import React, { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useGlobalStore } from "fdk-core/utils";
import { isLoggedIn } from "../../helper/auth-guard";
import { useThemeConfig } from "../../helper/hooks";
import ProfileRoot from "../../components/profile/profile-root";
import { SectionRenderer } from "fdk-core/components";
import { useSnackbar } from "../../helper/hooks";
import { useEmail } from "./useEmail";
import EmailPage from "@gofynd/theme-template/pages/profile/email";
import "@gofynd/theme-template/pages/profile/email/email.css";
import { useGlobalTranslation } from "fdk-core/utils";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";

function Email({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
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

  // Filter sections by canvas
  // Note: Sections from PAGE getter should already be page-specific
  const leftSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "left_side"
  );
  const rightSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "right_side"
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

  return (
    <ProfileRoot
      fpi={fpi}
      leftSections={leftSections}
      rightSections={rightSections}
      globalConfig={globalConfig}
    >
      <motion.div
        key={page?.value}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
        initial="hidden"
        animate="visible"
        style={{ height: "100%" }}
      >
        {leftSections.length > 0 ? (
          <SectionRenderer
            fpi={fpi}
            sections={leftSections}
            blocks={[]}
            preset={{}}
            globalConfig={globalConfig}
          />
        ) : (
          <EmailPage
            sendVerificationLinkToEmail={handleVerification}
            setEmailAsPrimary={handleSetPrimary}
            addEmail={handleAddEmail}
            deleteEmail={handleDelete}
            emails={emailList}
          />
        )}
      </motion.div>
    </ProfileRoot>
  );
}

Email.authGuard = isLoggedIn;

export default Email;
