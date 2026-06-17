import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useEmail } from "../page-layouts/profile/useEmail";
import EmptyState from "../components/empty-state/empty-state";
import { useGlobalTranslation, useFPI } from "fdk-core/utils";
import VerifiedTickIcon from "../assets/images/verified-tick.svg";
import Error404Icon from "../assets/images/email404.svg";
import {
  REFERRAL_SIGNUP_EVENT,
  REFERRAL_SIGNUP_PENDING_KEY,
} from "../helper/hooks/useAccounts";
import { isRunningOnClient } from "../helper/utils";

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
        const verifyEmailResponse = await verifyEmail(code);
        setIsEmailCodeValid(true);

        // If a signup was pending email-link verification, signup is now complete.
        // verifyMobileOtp / updateProfile stash the pending payload in sessionStorage
        // when their response signals verify_email_link=true.
        if (isRunningOnClient()) {
          try {
            const pendingRaw = sessionStorage.getItem(
              REFERRAL_SIGNUP_PENDING_KEY
            );
            if (pendingRaw) {
              let pendingPayload = null;
              try {
                pendingPayload = JSON.parse(pendingRaw);
              } catch (parseErr) {
                pendingPayload = null;
              }
              window.dispatchEvent(
                new CustomEvent(REFERRAL_SIGNUP_EVENT, {
                  detail: {
                    ...(pendingPayload || {}),
                    verify_email_response: verifyEmailResponse,
                    source: "verify-email-link",
                  },
                })
              );
              sessionStorage.removeItem(REFERRAL_SIGNUP_PENDING_KEY);
            }
          } catch (dispatchErr) {
            console.warn(
              "[Referral Signup Event] dispatch on email-link verify failed:",
              dispatchErr
            );
          }
        }
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
