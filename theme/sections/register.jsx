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
      bannerImage={pageConfig?.image_banner}
      bannerAlignment={pageConfig?.image_layout}
    >
      <Register {...registerProps} pageConfig={pageConfig} />
    </AuthContainer>
  );
}

export const settings = {
  label: "Register",
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

export default Component;
