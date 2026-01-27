import React, { useCallback, useMemo } from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import { usePhone } from "../page-layouts/profile/usePhone";
import { useAccounts } from "../helper/hooks";
import useInternational from "../components/header/useInternational";
import { useSnackbar } from "../helper/hooks";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import PhonePage from "@gofynd/theme-template/pages/profile/phone";
import "@gofynd/theme-template/pages/profile/phone/phone.css";
import styles from "../styles/canvas-profile.less";

export function Component({ props, blocks, preset, globalConfig }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
  const { showSnackbar } = useSnackbar();
  const { setMobileNumberAsPrimary, deleteMobileNumber, phoneNumbers } =
    usePhone({ fpi });
  const { sendOtpMobile, verifyMobileOtp, resendOtp } = useAccounts({ fpi });
  const { countryDetails } = useInternational({ fpi });

  // Destructure props with defaults
  const { title = "Phone Number" } = Object.fromEntries(
    Object.entries(props || {}).map(([key, obj]) => [key, obj?.value])
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

  const phoneList = useMemo(
    () =>
      phoneNumbers?.length === 1
        ? phoneNumbers
        : phoneNumbers?.filter((item) => item?.primary),
    [phoneNumbers]
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.profile.profile"), link: "/profile/details" },
      { label: t("resource.common.phone_number") },
    ],
    [t]
  );

  return (
    <div className={styles.canvasSection}>
      <Breadcrumb breadcrumb={breadcrumbItems} />
      <h1 className={styles.sectionTitle}>{title}</h1>
      <PhonePage
        setMobileNumberAsPrimary={handleSetPrimary}
        deleteMobileNumber={handleDelete}
        phoneNumbers={phoneList}
        sendOtpMobile={handleSendOtp}
        verifyMobileOtp={handleVerifyOtp}
        resendOtp={handleResendOtp}
        countryCode={countryDetails?.phone_code?.replace("+", "")}
      />
    </div>
  );
}

export const settings = {
  label: "Profile Phone",
  props: [
    {
      type: "text",
      id: "title",
      label: "Section Title",
      default: "Phone Number",
    },
  ],
};

export default Component;
