/* eslint-disable no-unused-vars */

import { useState, useMemo } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LOGIN_WITH_OTP,
  UPDATE_PROFILE,
  REGISTER_WITH_FORM,
  VERIFY_MOBILE_OTP,
  SEND_OTP_ON_MOBILE,
  VERIFY_EMAIL_OTP,
  SEND_OTP_ON_EMAIL,
  SEND_RESET_PASSWORD_EMAIL,
  LOGIN_WITH_EMAIL_AND_PASSWORD,
  LOGOUT,
  FORGOT_PASSWORD,
} from "../../queries/authQuery";
import { useSnackbar } from "./hooks";
import { isRunningOnClient } from "../utils";
// import { loginUserInFb } from '../../helper/facebook.utils';
// import { renderButton } from '../../helper/google.utils';

export const useAccounts = ({ fpi }) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const location = useLocation();

  const [facebookUser, setFacebookUser] = useState(null);

  const userData = useGlobalStore(fpi.getters.USER_DATA);
  const platformData = useGlobalStore(fpi.getters.PLATFORM_DATA);
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);

  const openLogin = ({ redirect = true } = {}) => {
    const queryParams = isRunningOnClient()
      ? new URLSearchParams(location.search)
      : null;
    if (redirect) {
      queryParams?.set(
        "redirectUrl",
        encodeURIComponent(location.pathname + location.search)
      );
    }
    navigate?.({
      pathname: "/auth/login",
      search: queryParams?.toString(),
    });
  };

  const openRegister = ({ redirect = true } = {}) => {
    const queryParams = isRunningOnClient()
      ? new URLSearchParams(location.search)
      : null;
    if (redirect) {
      queryParams?.set("redirectUrl", location.pathname);
    }
    navigate?.({
      pathname: "/auth/register",
      search: queryParams?.toString(),
    });
  };

  const openForgotPassword = () => {
    navigate?.({
      pathname: "/auth/forgot-password",
      search: location.search,
    });
  };

  const openHomePage = () => {
    const queryParams = isRunningOnClient()
      ? new URLSearchParams(location.search)
      : null;
    const redirectUrl = queryParams?.get("redirectUrl") || "";
    window.location.href =
      window.location.origin + decodeURIComponent(redirectUrl);
  };

  const updateProfile = (data) => {
    // this.$store.dispatch(UPDATE_PROFILE, data);
    const id = window.APP_DATA.applicationID;
    const {
      registerToken,
      firstName,
      lastName,
      gender,
      email,
      phone: { countryCode = "", mobile = "" } = {},
    } = data;

    const editProfileRequestSchemaInput = {
      first_name: firstName,
      last_name: lastName,
      gender,
    };

    if (countryCode) {
      editProfileRequestSchemaInput.country_code = countryCode.toString();
    }

    if (registerToken) {
      editProfileRequestSchemaInput.register_token = registerToken;
    }

    if (email) {
      editProfileRequestSchemaInput.email = email;
    }
    if (countryCode && mobile) {
      editProfileRequestSchemaInput.mobile = {
        country_code: countryCode?.toString(),
        phone: mobile,
      };
    }
    const payload = {
      platform: id,
      editProfileRequestSchemaInput,
    };

    return fpi.executeGQL(UPDATE_PROFILE, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      return res?.data?.updateProfile;
    });
  };

  const signOut = () =>
    fpi.executeGQL(LOGOUT).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      if (res?.data?.user?.logout?.logout) {
        const queryParams = isRunningOnClient()
          ? new URLSearchParams(location.search)
          : null;
        const redirectUrl = queryParams?.get("redirectUrl") || "";
        window.location.href =
          window.location.origin + decodeURIComponent(redirectUrl);
        return res?.data;
      }
      return Promise.reject();
    });

  const signIn = (data) => {
    // return this.$store.dispatch(SIGNIN_USER, data);
    const { isRedirection, password, username } = data;
    const payload = {
      passwordLoginRequestSchemaInput: {
        username,
        password,
      },
    };
    return fpi
      .executeGQL(LOGIN_WITH_EMAIL_AND_PASSWORD, payload)
      .then((res) => {
        if (res?.errors) {
          throw res?.errors?.[0];
        }
        if (isRedirection) {
          const queryParams = isRunningOnClient()
            ? new URLSearchParams(location.search)
            : null;
          const redirectUrl = queryParams?.get("redirectUrl") || "";
          window.location.href =
            window.location.origin + decodeURIComponent(redirectUrl);
        }
        return res?.data?.loginWithEmailAndPassword;
      });
  };

  const sendOtp = ({ mobile, countryCode }) => {
    // return this.$store.dispatch(SEND_OTP, data);
    const id = window.APP_DATA.applicationID;

    const payload = {
      platform: id,
      sendOtpRequestSchemaInput: {
        mobile,
        country_code: countryCode,
      },
    };
    return fpi.executeGQL(LOGIN_WITH_OTP, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      return res?.data?.loginWithOTP;
    });
  };

  const resendOtp = ({ mobile, countryCode, token, action }) => {
    // return this.$store.dispatch(RESEND_OTP, data);
    const id = window.APP_DATA.applicationID;

    const payload = {
      platform: id,
      sendMobileOtpRequestSchemaInput: {
        mobile,
        country_code: countryCode,
        token,
        action,
      },
    };
    return fpi.executeGQL(SEND_OTP_ON_MOBILE, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      return res?.data?.sendOTPOnMobile;
    });
  };

  const signInWithOtp = ({ otp, requestId, isRedirection = true }) => {
    // return this.$store.dispatch(SIGNIN_USER_WITH_OTP, {
    // 	is_redirection: true,
    // 	...data,
    // });

    const id = window.APP_DATA.applicationID;

    const payload = {
      platform: id,
      verifyOtpRequestSchemaInput: {
        otp,
        request_id: requestId,
      },
    };

    return fpi.executeGQL(VERIFY_MOBILE_OTP, payload).then((res) => {
      if (res.errors) {
        throw res.errors?.[0];
      }
      const { user_exists: userExists } = res.data.verifyMobileOTP || {};
      if (!userExists) {
        if (isRedirection) {
          navigate?.({
            pathname: "/auth/edit-profile",
            search: location.search,
          });
        }
      } else {
        const queryParams = isRunningOnClient()
          ? new URLSearchParams(location.search)
          : null;
        const redirectUrl = queryParams?.get("redirectUrl") || "";
        window.location.href =
          window.location.origin + decodeURIComponent(redirectUrl);
      }
      return res.data.verifyMobileOTP;
    });
  };

  const signUp = (data) => {
    // return this.$store.dispatch(SIGNUP_USER, data);
    const id = window.APP_DATA.applicationID;
    const {
      registerToken,
      firstName,
      lastName,
      gender,
      email,
      phone: { countryCode, mobile },
      password,
    } = data;
    const formRegisterRequestSchemaInput = {
      gender,
      first_name: firstName,
      last_name: lastName,
      password,
      register_token: registerToken,
    };

    if (email) {
      formRegisterRequestSchemaInput.email = email;
    }
    if (countryCode && mobile) {
      formRegisterRequestSchemaInput.phone = {
        country_code: countryCode,
        mobile,
      };
    }
    const payload = {
      platform: id,
      formRegisterRequestSchemaInput,
    };

    return fpi.executeGQL(REGISTER_WITH_FORM, payload).then((res) => {
      if (res.errors) {
        throw res.errors?.[0];
      }
      return res?.data?.registerWithForm;
    });
  };

  const setPassword = ({ password, code }) => {
    // return this.$store.dispatch(SET_PASSWORD, data);
    const payload = {
      forgotPasswordRequestSchemaInput: {
        code,
        password,
      },
    };
    return fpi.executeGQL(FORGOT_PASSWORD, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      navigate?.({
        pathname: "/",
      });
      return res?.data?.forgotPassword;
    });
  };

  const sendOtpMobile = (data) => {
    const id = window.APP_DATA.applicationID;
    const { mobile, countryCode, action = "send" } = data;
    const sendMobileOtpRequestSchemaInput = {
      mobile,
      country_code: countryCode,
      action,
    };

    const payload = {
      sendMobileOtpRequestSchemaInput,
      platform: id,
    };

    return fpi.executeGQL(SEND_OTP_ON_MOBILE, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      return res?.data?.sendOTPOnMobile;
    });
  };

  const sendResetPasswordEmail = (data) => {
    // return this.$store.dispatch(SEND_RESET_PASSWORD_EMAIL, data);
    const id = window.APP_DATA.applicationID;
    const { email } = data;

    const payload = {
      platform: id,
      sendResetPasswordEmailRequestSchemaInput: {
        email,
      },
    };
    return fpi.executeGQL(SEND_RESET_PASSWORD_EMAIL, payload).then((res) => {
      if (res?.errors) {
        showSnackbar(
          "Failed to send the reset link to your primary email address.",
          "error"
        );
        throw res?.errors?.[0];
      }
      if (res?.data?.sendResetPasswordEmail?.status === "success") {
        showSnackbar(
          "The reset link has been sent to your primary email address.",
          "success"
        );
      }
      return res?.data?.sendResetPasswordEmail;
    });
  };

  const sendResetPasswordMobile = (data) => {
    // return this.$store.dispatch(SEND_RESET_PASSWORD_MOBILE, data);
  };

  const resendVerifyMobileOtp = (data) => {
    // return this.$store.dispatch(RESEND_VERIFY_OTP_MOBILE, data);
    const { mobile, countryCode, token } = data;
    const id = window.APP_DATA.applicationID;

    const payload = {
      platform: id,
      sendMobileOtpRequestSchemaInput: {
        mobile,
        country_code: countryCode,
        token,
        action: "resend",
      },
    };
    return fpi.executeGQL(SEND_OTP_ON_MOBILE, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      return res?.data?.sendOTPOnMobile;
    });
  };

  const resendVerifyEmailOtp = (data) => {
    // return this.$store.dispatch(RESEND_VERIFY_OTP_EMAIL, data);
    const { email, registerToken, token } = data;
    const id = window.APP_DATA.applicationID;

    const payload = {
      platform: id,
      sendEmailOtpRequestSchemaInput: {
        email,
        register_token: registerToken,
        token,
        action: "resend",
      },
    };
    return fpi.executeGQL(SEND_OTP_ON_EMAIL, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      return res?.data?.sendOTPOnEmail;
    });
  };

  const verifyMobileOtp = (data) => {
    // return this.$store.dispatch(VERIFY_MOBILE_OTP, data);
    const {
      requestId = "",
      registerToken = "",
      otp,
      isEmailVerified,
      isRedirection,
    } = data;
    const id = window.APP_DATA.applicationID;

    const payload = {
      platform: id,
      verifyOtpRequestSchemaInput: {
        otp,
        register_token: registerToken,
        request_id: requestId,
      },
    };
    return fpi.executeGQL(VERIFY_MOBILE_OTP, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      const {
        user_exists: userExists,
        email,
        verify_email_link: verifyEmailLink,
      } = res?.data?.verifyMobileOTP || {};
      if (userExists) {
        if (verifyEmailLink) {
          if (isRedirection) {
            const queryParams = isRunningOnClient()
              ? new URLSearchParams(location.search)
              : null;
            queryParams?.set("email", email);
            navigate?.({
              pathname: "/auth/verify-email-link",
              search: queryParams?.toString(),
            });
          }
        } else if (isRedirection) {
          const queryParams = isRunningOnClient()
            ? new URLSearchParams(location.search)
            : null;
          const redirectUrl = queryParams?.get("redirectUrl") || "";
          window.location.href =
            window.location.origin + decodeURIComponent(redirectUrl);
        }
      }
      return res?.data?.verifyMobileOTP;
    });
  };

  const verifyEmailOtp = (data) => {
    const {
      otp,
      email,
      registerToken,
      action,
      isMobileVerified,
      isRedirection,
    } = data;
    const id = window.APP_DATA.applicationID;

    const payload = {
      platform: id,
      verifyEmailOtpRequestSchemaInput: {
        register_token: registerToken,
        otp,
        email,
        action,
      },
    };
    return fpi.executeGQL(VERIFY_EMAIL_OTP, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      const { user_exists: userExists } = res?.data?.verifyEmailOTP || {};
      if (!userExists) {
        if (isRedirection) {
          navigate?.({
            pathname: "/auth/edit-profile",
            search: location.search,
          });
        }
      } else {
        if (isRedirection) {
          const queryParams = isRunningOnClient()
            ? new URLSearchParams(location.search)
            : null;
          const redirectUrl = queryParams?.get("redirectUrl") || "";
          window.location.href =
            window.location.origin + decodeURIComponent(redirectUrl);
        }
      }
      return res?.data?.verifyEmailOTP;
    });
  };

  const sendVerificationLinkEmail = (data) => {
    // return this.$store.dispatch(SEND_VERIFICATION_LINK_EMAIL, data);
  };

  const facebookText = useMemo(() => {
    if (facebookUser?.is_signed_in) {
      return `Continue as ${facebookUser.profile.full_name}`;
    }
    return "Login with Facebook";
  }, [facebookUser]);

  const facebookLogin = async () => {
    // const appId = this.platformData.social_tokens.facebook.app_id;
    // if (appId) {
    // 	if (!this.facebookUser?.is_signed_in) {
    // 		this.facebookUser = await loginUserInFb();
    // 	}
    // 	return this.$store.dispatch(FACEBOOK_LOGIN, {
    // 		facebook_user: this.facebookUser,
    // 	});
    // } else {
    // 	throw new Error('Facebook App ID not provided in platform');
    // }
  };

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  const facebook = useMemo(() => ({
    display_text: facebookText,
    login: facebookLogin,
  }));

  const addEmail = (value) => {
    // const appName = platformData.name;
    // return this.$root.$apiSDK.user.addEmail({
    // 	platform: appName,
    // 	body: value,
    // });
  };

  const deleteUser = (data) => {
    // return this.$store.dispatch(DELETE_USER, data);
  };

  const sendForgotOtpMobile = (data) => {
    // return this.$store.dispatch(SEND_FORGOT_OTP_MOBILE, data);
  };

  const sendForgotOtpEmail = (data) => {
    // return this.$store.dispatch(SEND_FORGOT_OTP_EMAIL, data);
  };

  const verifyForgotMobileOtp = (data) => {
    // return this.$store.dispatch(VERIFY_MOBILE_FORGOT_OTP, data);
  };

  const verifyForgotEmailOtp = (data) => {
    // return this.$store.dispatch(VERIFY_EMAIL_FORGOT_OTP, data);
  };

  const resetForgotPassword = (data) => {
    // return this.$store.dispatch(RESET_FORGOT_PASSWORD, data);
  };

  return {
    userData,
    platformData,
    isLoggedIn,
    openLogin,
    openRegister,
    openForgotPassword,
    openHomePage,
    updateProfile,
    signOut,
    signIn,
    sendOtp,
    resendOtp,
    signInWithOtp,
    signUp,
    setPassword,
    sendOtpMobile,
    sendResetPasswordEmail,
    sendResetPasswordMobile,
    resendVerifyMobileOtp,
    resendVerifyEmailOtp,
    verifyMobileOtp,
    verifyEmailOtp,
    sendVerificationLinkEmail,
    facebook,
    addEmail,
  };
};
