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
  label: "t:resource.common.login",
  props: [
    {
      id: "image_layout",
      type: "select",
      options: [
        {
          value: "no_banner",
          text: "t:resource.common.no_banner",
        },
        {
          value: "right_banner",
          text: "t:resource.common.right_banner",
        },
        {
          value: "left_banner",
          text: "t:resource.common.left_banner",
        },
      ],
      default: "no_banner",
      label: "t:resource.common.image_layout",
    },
    {
      type: "image_picker",
      id: "image_banner",
      default: "",
      label: "t:resource.common.image_banner",
    },
  ],
};
