import React from "react";

export function Component({ props, globalConfig }) {
  const { code } = props;

  return !code?.value ? null : (
    <div
      className="basePageContainer margin0auto"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: code.value }}
      style={{
        paddingTop: `16px`,
        paddingBottom: `16px`,
      }}
    />
  );
}

export const settings = {
  label: "Custom HTML",
  props: [
    {
      id: "code",
      label: "Your Code Here",
      type: "code",
      default: "",
      info: "Add Your custom HTML Code below. You can also use the full screen icon to open a code editor and add your code",
    },
  ],
  blocks: [],
};
export default Component;
