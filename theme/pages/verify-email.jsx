import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useEmail } from "../page-layouts/profile/useEmail";
import EmptyState from "../components/empty-state/empty-state";
import VerifiedTickIcon from "../assets/images/verified-tick.svg";
import Error404Icon from "../assets/images/email404.svg";

function VerifyEmail({ fpi }) {
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
  }, []);

  useEffect(() => {
    handleEmailVerification();
  }, []);

  return isLoading ? (
    <></>
  ) : (
    <EmptyState
      Icon={
        <div>{isEmailCodeValid ? <VerifiedTickIcon /> : <Error404Icon />}</div>
      }
      title={`${isEmailCodeValid ? "Email Successfully Verified" : "Code Expired / Invalid Request"}`}
    />
  );
}

export default VerifyEmail;
