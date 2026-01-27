import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useEmail } from "../page-layouts/profile/useEmail";
import EmptyState from "../components/empty-state/empty-state";
import { useGlobalTranslation, useFPI } from "fdk-core/utils";
import VerifiedTickIcon from "../assets/images/verified-tick.svg";
import Error404Icon from "../assets/images/email404.svg";

export function Component() {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
  const { verifyEmail } = useEmail({ fpi });

  const [searchParams] = useSearchParams();
  const [isEmailCodeValid, setIsEmailCodeValid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const handleEmailVerification = useCallback(async () => {
    try {
      setIsLoading(true);
      const code = searchParams.get("code");
      await verifyEmail(code);
      setIsEmailCodeValid(true);
      setIsLoading(false);
    } catch (error) {
      setIsEmailCodeValid(false);
      setIsLoading(false);
    }
  }, [searchParams, verifyEmail]);

  useEffect(() => {
    handleEmailVerification();
  }, [handleEmailVerification]);

  return isLoading ? (
    <></>
  ) : (
    <EmptyState
      Icon={
        <div>{isEmailCodeValid ? <VerifiedTickIcon /> : <Error404Icon />}</div>
      }
      title={`${
        isEmailCodeValid
          ? t("resource.verify_email.email_success")
          : t("resource.verify_email.code_expired")
      }`}
    />
  );
}

export default Component;

export const settings = {
  label: "Verify Email",
  props: [],
  blocks: [],
  preset: {},
};
