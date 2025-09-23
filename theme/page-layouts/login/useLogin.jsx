import { useState, useMemo } from "react";
import {
  useGlobalStore,
  useGlobalTranslation,
  useNavigate,
} from "fdk-core/utils";
import { useLocation, useParams } from "react-router-dom";
import { useAccounts, useThemeConfig } from "../../helper/hooks";
import useLoginOtp from "./useLoginOtp";
import useLoginPassword from "./useLoginPassword";
import { isRunningOnClient, getLocalizedRedirectUrl } from "../../helper/utils";
import {
  GOOGLE_LOGIN,
  LOGIN_WITH_FACEBOOK_MUTATION,
  APPLE_LOGIN,
} from "../../queries/socialLoginQuery";
import { jwtDecode } from "jwt-decode";

const useLogin = ({ fpi }) => {
  const { locale } = useParams();
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const [isPasswordToggle, setIsPasswordToggle] = useState(false);
  const platformData = useGlobalStore(fpi.getters.PLATFORM_DATA);
  const { application_id } = useGlobalStore(fpi.getters.THEME) || {};
  const appFeatures = useGlobalStore(fpi.getters.APP_FEATURES);

  const { handleLoginWithOtp, getOtpLoading, ...restOtp } = useLoginOtp({
    fpi,
    isLoginToggle: isPasswordToggle,
  });
  const { handleLoginWthPassword, setPasswordError, ...restPassword } =
    useLoginPassword({ fpi });

  const { openRegister } = useAccounts({ fpi });
  const navigate = useNavigate();

  const logo = useMemo(
    () => ({
      desktop: {
        link: "/",
        url: platformData?.desktop_image,
        alt: t("resource.auth.login.desktop_logo_alt"),
      },
      mobile: {
        link: "/",
        url: platformData?.mobile_image || platformData?.desktop_image,
        alt: t("resource.auth.login.mobile_logo_alt"),
      },
    }),
    [platformData]
  );

  const showLoginToggleButton = useMemo(
    () => platformData?.login?.otp && platformData?.login?.password,
    [platformData]
  );

  const isPassword = useMemo(() => {
    if (platformData?.login?.otp && platformData?.login?.password) {
      return isPasswordToggle;
    }
    return platformData?.login?.password;
  }, [platformData, isPasswordToggle]);

  const isOtp = useMemo(() => {
    if (platformData?.login?.otp && platformData?.login?.password) {
      return !isPasswordToggle;
    }
    return platformData?.login?.otp;
  }, [platformData, isPasswordToggle]);

  const googleClientId = useMemo(() => {
    if (
      platformData?.social_tokens &&
      platformData?.social_tokens?.google?.app_id
    ) {
      return platformData?.social_tokens?.google?.app_id;
    }
  }, [platformData]);
  const facebookAppId = useMemo(() => {
    if (
      platformData?.social_tokens &&
      platformData?.social_tokens?.facebook?.app_id
    ) {
      return platformData?.social_tokens?.facebook?.app_id;
    }
  }, [platformData]);
  const appleId = useMemo(() => {
    if (
      platformData?.social_tokens &&
      platformData?.social_tokens?.apple?.app_id
    ) {
      return platformData?.social_tokens?.apple?.app_id;
    }
  }, [platformData]);
  const appleRedirectURI = useMemo(() => {
    if (
      platformData?.social_tokens &&
      platformData?.social_tokens?.apple?.redirectURI
    ) {
      return platformData?.social_tokens?.apple?.redirectURI;
    }
  }, [platformData]);

  const handleRegisterClick = () => {
    const pathname = isRunningOnClient() ? location.pathname : "";
    if (pathname?.includes("/auth/login")) {
      openRegister();
    }
  };

  const handleLoginModeToggle = () => {
    setIsPasswordToggle((prevState) => !prevState);
    setPasswordError(false);
  };

  const handleLoginFormSubmit = (...args) => {
    if (isOtp) {
      handleLoginWithOtp(...args);
    }
    if (isPassword) {
      handleLoginWthPassword(...args);
    }
  };

  function handleUserRedirect(res, providerKey) {
    if (res.errors) {
      throw new Error(res.errors[0].message);
    }
    const data = res?.data?.[providerKey];
    const userExists = data?.user_exists;
    fpi.custom.setValue("user_Data", data);
    if (userExists) {
      const queryParams = isRunningOnClient()
        ? new URLSearchParams(location.search)
        : null;
      const redirectUrl = queryParams?.get("redirectUrl") || "";
      const finalUrl = getLocalizedRedirectUrl(
        decodeURIComponent(redirectUrl),
        locale
      );
      window.location.href = window.location.origin + finalUrl;
    } else {
      const qs = isRunningOnClient() ? location.search : "";
      navigate(`/auth/edit-profile${qs}`);
    }
    return data;
  }

  const getGoogleUserInfo = (response, payload) => {
    return {
      oAuthRequestSchemaInput: {
        is_signed_in: true,
        oauth2: {
          access_token: response?.credential ?? null,
          expiry: payload?.exp ?? null,
        },
        profile: {
          id: payload?.sub ?? null,
          email: payload?.email ?? null,
          full_name: payload?.name ?? null,
          first_name: payload?.given_name ?? null,
          last_name: payload?.family_name ?? null,
          image: payload?.picture ?? null,
        },
      },
      platform: application_id,
    };
  };
  // Google credential callback
  const onGoogleCredential = async (response) => {
    try {
      let userCred = response.credential;
      let payload = jwtDecode(userCred);
      let data = getGoogleUserInfo(response, payload);
      return fpi.executeGQL(GOOGLE_LOGIN, data).then((res) => {
        handleUserRedirect(res, "loginWithGoogle");
      });
    } catch (err) {
      const isDeleted = err?.details?.meta?.is_deleted;
      if (isDeleted) {
        const qs = isRunningOnClient() ? location.search : "";
        window.location.href = `${window.location.origin}/auth/account-locked${qs}`;
        return;
      }
      throw err;
    }
  };
  const loginWithFacebookMutation = async (variables) => {
    try {
      return fpi
        .executeGQL(LOGIN_WITH_FACEBOOK_MUTATION, variables)
        .then((res) => {
          handleUserRedirect(res, "loginWithFacebook");
        });
    } catch (err) {
      const isDeleted = err?.details?.meta?.is_deleted;
      if (isDeleted) {
        const qs = isRunningOnClient() ? location.search : "";
        window.location.href = `${window.location.origin}/auth/account-locked${qs}`;
        return;
      }
      throw err;
    }
  };
  const getAppleUserInfo = ({ idTokenPayload, userNameObj }) => {
    const { sub: user_identifier = null } = idTokenPayload || {};
    // Apple only returns name once (first sign-in)
    const first_name = userNameObj?.firstName ?? null;
    const last_name = userNameObj?.lastName ?? null;
    const full_name = [first_name, last_name].filter(Boolean).join(" ") || null;
    return {
      oAuthRequestAppleSchemaInput: {
        oauth: {
          identity_token: idTokenPayload?.id_token ?? null,
        },
        profile: {
          first_name,
          full_name,
          last_name,
        },
        user_identifier,
      },
      platform: application_id,
    };
  };
  const onAppleCredential = async (response) => {
    try {
      const idToken = response?.authorization?.id_token;
      if (!idToken) throw new Error("Missing Apple ID token");
      const payload = jwtDecode(idToken);
      const idTokenPayload = { ...payload, id_token: idToken };
      // `user` exists only on first sign-in, and includes { name: { firstName, lastName }, email? }
      const userNameObj = response?.user?.name || null;
      const vars = getAppleUserInfo({ idTokenPayload, userNameObj });
      const res = await fpi.executeGQL(APPLE_LOGIN, vars);
      handleUserRedirect(res, "loginWithAppleIOS");
    } catch (err) {
      const isDeleted = err?.details?.meta?.is_deleted;
      if (isDeleted) {
        const qs = isRunningOnClient() ? location.search : "";
        window.location.href = `${window.location.origin}/auth/account-locked${qs}`;
        return;
      }
      throw err;
    }
  };
  const handleGoogleError = (error) => {
    console.error("Google login failed:", error);
  };

  return {
    logo,
    title: platformData?.display,
    subTitle: platformData?.subtext,
    isPassword,
    isOtp,
    showLoginToggleButton,
    isRegisterEnabled: platformData?.register,
    registerButtonLabel: t("resource.common.go_to_register"),
    loginButtonText: appFeatures?.landing_page?.login_btn_text,
    isForgotPassword: platformData?.forgot_password,
    ...restOtp,
    ...restPassword,
    getOtpLoading,
    onLoginToggleClick: handleLoginModeToggle,
    onRegisterButtonClick: handleRegisterClick,
    onLoginFormSubmit: handleLoginFormSubmit,
    googleClientId,
    appleId,
    appleRedirectURI,
    facebookAppId,
    social: platformData?.social,
    handleGoogleError,
    onGoogleCredential,
    onAppleCredential,
    loginWithFacebookMutation,
    application_id,
  };
};

export default useLogin;
