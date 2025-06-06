import React, { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { isLoggedIn } from "../../helper/auth-guard";
import ProfileRoot from "../../components/profile/profile-root";
import { useSnackbar } from "../../helper/hooks";
import { useEmail } from "./useEmail";
import EmailPage from "@gofynd/theme-template/pages/profile/email";
import "@gofynd/theme-template/pages/profile/email/email.css";
import { useGlobalTranslation } from "fdk-core/utils";

function Email({ fpi }) {
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

  const handleVerification = useCallback(async (email) => {
    try {
      await sendVerificationLinkToEmail(email);
      showSnackbar(`${t("resource.profile.verification_link_sent_to")} ${email}`, "success");
    } catch (error) {
      showSnackbar(error?.message, "error");
      throw error;
    }
  }, []);

  const handleSetPrimary = useCallback(async (email) => {
    try {
      await setEmailAsPrimary(email);
      showSnackbar(`${email} ${t("resource.profile.set_as_primary")}`, "success");
    } catch (error) {
      showSnackbar(error?.message, "error");
      throw error;
    }
  }, []);

  const handleDelete = useCallback(async (emailDetails) => {
    try {
      await deleteEmail(emailDetails);
      showSnackbar(`${emailDetails?.email} ${t("resource.common.removed_success")}`, "success");
    } catch (error) {
      showSnackbar(error?.message, "error");
      throw error;
    }
  }, []);

  const handleAddEmail = useCallback(async (email) => {
    try {
      await addEmail(email);
      showSnackbar(`${t("resource.profile.set_as_primary")} ${email}`, "success");
    } catch (error) {
      showSnackbar(error?.message, "error");
      throw error;
    }
  }, []);

  const emailList = useMemo(
    () =>
      emails?.length === 1 ? emails : emails?.filter((item) => item?.primary),
    [emails]
  );

  return (
    <ProfileRoot fpi={fpi}>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
        initial="hidden"
        animate="visible"
      >
        <EmailPage
          sendVerificationLinkToEmail={handleVerification}
          setEmailAsPrimary={handleSetPrimary}
          addEmail={handleAddEmail}
          deleteEmail={handleDelete}
          emails={emailList}
        />
      </motion.div>
    </ProfileRoot>
  );
}

Email.authGuard = isLoggedIn;

export default Email;
