import React from "react";
import Login from "@gofynd/theme-template/pages/login/login";
import { useFPI } from "fdk-core/utils";
import "@gofynd/theme-template/pages/login/login.css";
import useLogin from "../page-layouts/login/useLogin";
import AuthContainer from "../page-layouts/auth/auth-container/auth-container";
import { getConfigFromProps } from "../helper/utils";

function Component({ props }) {
  const fpi = useFPI();

  const loginProps = useLogin({ fpi });

  const pageConfig = getConfigFromProps(props);

  return (
    <AuthContainer
      bannerImage={pageConfig?.image_banner}
      bannerAlignment={pageConfig?.image_layout}
    >
      <Login {...loginProps} pageConfig={pageConfig} />
    </AuthContainer>
  );
}

export default Component;

export const settings = {
  label: "Login",
  props: [
    {
      id: "image_layout",
      type: "select",
      options: [
        {
          value: "no_banner",
          text: "No Banner",
        },
        {
          value: "right_banner",
          text: "Right Banner",
        },
        {
          value: "left_banner",
          text: "Left Banner",
        },
      ],
      default: "no_banner",
      label: "Image Layout",
    },
    {
      type: "image_picker",
      id: "image_banner",
      default: "",
      label: "Image Banner",
    },
  ],
};
