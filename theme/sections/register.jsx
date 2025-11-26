import React from "react";
import { useFPI } from "fdk-core/utils";
import Register from "@gofynd/theme-template/pages/register/register";
import "@gofynd/theme-template/pages/register/register.css";
import AuthContainer from "../page-layouts/auth/auth-container/auth-container";
import useRegister from "../page-layouts/register/useRegister";
import { getConfigFromProps } from "../helper/utils";

function Component({ props }) {
  const fpi = useFPI();
  const registerProps = useRegister({ fpi });
  const pageConfig = getConfigFromProps(props);

  return (
    <AuthContainer
      bannerAlignment={pageConfig?.image_layout}
      bannerImage={pageConfig?.image_banner}
    >
      <Register {...registerProps} pageConfig={pageConfig} />
    </AuthContainer>
  );
}

export const settings = {
  label: "t:resource.common.register",
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

export default Component;
