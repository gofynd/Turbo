import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SEND_RESET_TOKEN } from "../../queries/authQuery";
import { useAccounts, useSnackbar } from "../../helper/hooks";
import { useNavigate, useGlobalTranslation } from "fdk-core/utils";

const useSetPassword = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState(null);

  const { setPassword } = useAccounts({ fpi });

  const { showSnackbar } = useSnackbar();

  const query = new URLSearchParams(location.search);

  useEffect(() => {
    const payload = {
      codeRequestBodySchemaInput: {
        code: query.get("code"),
      },
    };
    return () => {
      fpi
        .executeGQL(SEND_RESET_TOKEN, payload)
        .then((res) => {
          if (res?.errors) {
            throw res?.errors?.[0];
          }
          return res?.data?.sendResetToken;
        })
        .catch((err) => {
          const queryParams = new URLSearchParams();
          navigate("/auth/login" + (queryParams?.toString() ? `?${queryParams.toString()}` : ""));
        });
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const handleSetPassword = ({ newPassword }) =>
    setPassword({
      password: newPassword,
      code: query.get("code"),
    })
      .then((res) => {
        setError(null);
        showSnackbar(t("resource.common.password_reset_successful"), "success");
      })
      .catch((err) => {
        setError({ message: err?.message || t("resource.common.error_message") });
      });

  return { error, onSetPasswordSubmit: handleSetPassword };
};

export default useSetPassword;
