import React, { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { isLoggedIn } from "../../helper/auth-guard";
import { useThemeConfig } from "../../helper/hooks";
import ProfileRoot from "../../components/profile/profile-root";
import { SectionRenderer } from "fdk-core/components";
import "@gofynd/theme-template/page-layouts/auth/mobile-number/mobile-number.css";
import { usePhone } from "./usePhone";
import useInternational from "../../components/header/useInternational";
import { useSnackbar, useAccounts } from "../../helper/hooks";
import PhonePage from "@gofynd/theme-template/pages/profile/phone";
import "@gofynd/theme-template/pages/profile/phone/phone.css";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";

function Phone({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
  const { setMobileNumberAsPrimary, deleteMobileNumber, phoneNumbers } =
    usePhone({ fpi });
  const { sendOtpMobile, verifyMobileOtp, resendOtp } = useAccounts({ fpi });
  const { showSnackbar } = useSnackbar();
  const { countryDetails } = useInternational({ fpi });

  // Filter sections by canvas
  const leftSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "left_side"
  );
  const rightSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "right_side"
  );

  const handleSetPrimary = useCallback(
    async (phoneDetails) => {
      try {
        await setMobileNumberAsPrimary(phoneDetails);
        showSnackbar(
          `${phoneDetails?.phone} ${t("resource.profile.set_as_primary")}`,
          "success"
        );
      } catch (error) {
        showSnackbar(error?.message, "error");
        throw error;
      }
    },
    [setMobileNumberAsPrimary, showSnackbar, t]
  );

  const handleSendOtp = useCallback(
    async (phoneDetails) => {
      try {
        const data = await sendOtpMobile(phoneDetails);
        showSnackbar(
          `${t("resource.profile.otp_sent_mobile")} ${phoneDetails?.mobile}`,
          "success"
        );
        return data;
      } catch (error) {
        showSnackbar(error?.message, "error");
        throw error;
      }
    },
    [sendOtpMobile, showSnackbar, t]
  );

  const handleVerifyOtp = useCallback(
    async (otpDetails) => {
      try {
        await verifyMobileOtp(otpDetails);
        showSnackbar(t("resource.profile.phone_number_verified"), "success");
      } catch (error) {
        showSnackbar(error?.message, "error");
        throw error;
      }
    },
    [verifyMobileOtp, showSnackbar, t]
  );

  const handleResendOtp = useCallback(
    async (phoneDetails) => {
      try {
        const data = await resendOtp(phoneDetails);
        showSnackbar(
          `${t("resource.profile.otp_sent_mobile")} ${phoneDetails?.mobile}`,
          "success"
        );
        return data;
      } catch (error) {
        showSnackbar(error?.message, "error");
        throw error;
      }
    },
    [resendOtp, showSnackbar, t]
  );

  const handleDelete = useCallback(
    async (phoneDetails) => {
      try {
        await deleteMobileNumber(phoneDetails);
        showSnackbar(
          `${phoneDetails?.phone} ${t("resource.common.removed_success")}`,
          "success"
        );
      } catch (error) {
        showSnackbar(error?.message, "error");
        throw error;
      }
    },
    [deleteMobileNumber, showSnackbar, t]
  );

  const phoneList = useMemo(
    () =>
      phoneNumbers?.length === 1
        ? phoneNumbers
        : phoneNumbers?.filter((item) => item?.primary),
    [phoneNumbers]
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
          <PhonePage
            setMobileNumberAsPrimary={handleSetPrimary}
            deleteMobileNumber={handleDelete}
            phoneNumbers={phoneList}
            sendOtpMobile={handleSendOtp}
            verifyMobileOtp={handleVerifyOtp}
            resendOtp={handleResendOtp}
            countryCode={countryDetails?.phone_code?.replace("+", "")}
          />
        )}
      </motion.div>
    </ProfileRoot>
  );
}

Phone.authGuard = isLoggedIn;

export default Phone;
