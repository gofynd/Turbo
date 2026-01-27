import React from "react";
import { useFPI } from "fdk-core/utils";
import AuthContainer from "../page-layouts/auth/auth-container/auth-container";
import SetPasswordPage from "../page-layouts/set-password/set-password-page";
import { getConfigFromProps } from "../helper/utils";

export function Component({ props }) {
  const fpi = useFPI();
  const pageConfig = getConfigFromProps(props);

  return (
    <AuthContainer
      bannerImage={pageConfig?.image_banner}
      bannerAlignment={pageConfig?.image_layout}
    >
      <SetPasswordPage fpi={fpi} />
    </AuthContainer>
  );
}

export default Component;

export const settings = {
  label: "Set Password",
  props: [
    {
      id: "image_layout",
      type: "select",
      options: [
        { value: "no_banner", text: "No Banner" },
        { value: "right_banner", text: "Right Banner" },
        { value: "left_banner", text: "Left Banner" },
      ],
      default: "no_banner",
      label: "Image Layout",
    },
    {
      type: "image_picker",
      id: "image_banner",
      default: "",
      label: "Banner Image",
    },
  ],
  blocks: [],
  preset: {},
};

