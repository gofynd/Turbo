import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setIsEmailCodeValid(false);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        setIsLoading(true);
        await verifyEmail(code);
        setIsEmailCodeValid(true);
      } catch (error) {
        setIsEmailCodeValid(false);
      } finally {
        setIsLoading(false);
      }
    })();
    // Run once on mount; React Router remounts on URL change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
