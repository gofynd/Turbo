import { useState } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useLocation } from "react-router-dom";
import { useAccounts } from "../../helper/hooks";
import useInternational from "../../components/header/useInternational";
import useVerifyDetails from "../auth/useVerifyDetails";
// import { useLocation, useNavigate, createSearchParams } from 'react-router-dom';

const useRegister = ({ fpi }) => {
  const { pathname } = useLocation();
  const { countryDetails } = useInternational({ fpi });
  const platformData = useGlobalStore(fpi.getters.PLATFORM_DATA);

  const [isFormSubmitSuccess, setIsFormSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [verifyBothData, setVerifyBothData] = useState(null);

  const { signUp, openHomePage, openLogin } = useAccounts({ fpi });
  const verifyDetailsProp = useVerifyDetails({ fpi, verifyBothData });

  const isEmail = platformData?.required_fields?.email?.is_required;
  const emailLevel = platformData?.required_fields?.email?.level;

  const isMobile = platformData?.required_fields?.mobile?.is_required;
  const mobileLevel = platformData?.required_fields?.mobile?.level;

  const handleLoginClick = () => {
    if (pathname === "/auth/register") {
      openLogin({ redirect: false });
    }
  };

  const handleFormSubmit = (formData) => {
    const user = { ...formData, registerToken: "" };
    signUp(user)
      .then((res) => {
        window?.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
        setVerifyBothData(res);
        if (res?.verify_mobile_otp || res?.verify_email_otp) {
          setIsFormSubmitSuccess(true);
        } else {
          openHomePage();
        }
      })
      .catch((err) => {
        setError({
          message: err?.message || "Something went wrong",
        });
      });
  };

  return {
    isFormSubmitSuccess,
    isEmail,
    emailLevel,
    isMobile,
    mobileLevel,
    mobileInfo: {
      countryCode: countryDetails?.phone_code?.replace("+", "") ?? "91",
      mobile: "",
      isValidNumber: false,
    },
    error,
    loginButtonLabel: "GO TO LOGIN",
    verifyDetailsProp,
    onLoginButtonClick: handleLoginClick,
    onRegisterFormSubmit: handleFormSubmit,
  };
};

export default useRegister;
