import React from "react";
import { motion } from "framer-motion";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import { isLoggedIn } from "../helper/auth-guard";
import { useThemeConfig } from "../helper/hooks";
import ProfileRoot from "../components/profile/profile-root";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";

function ProfilePhone({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};

  // Filter sections by canvas
  const leftSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "left_side"
  );
  const rightSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "right_side"
  );

  return (
    page?.value === "profile-phone" && (
      <ProfileRoot
        fpi={fpi}
        leftSections={leftSections}
        rightSections={rightSections}
        globalConfig={globalConfig}
      >
        <motion.div
          key={page?.value}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } },
          }}
          initial="hidden"
          animate="visible"
          style={{ height: "100%" }}
        >
          {leftSections.length > 0 && (
            <SectionRenderer
              fpi={fpi}
              sections={leftSections}
              blocks={[]}
              preset={{}}
              globalConfig={globalConfig}
            />
          )}
        </motion.div>
      </ProfileRoot>
    )
  );
}

ProfilePhone.authGuard = isLoggedIn;

export const sections = JSON.stringify([
  {
    canvas: {
      value: "left_side",
      label: "Left Panel",
    },
    attributes: {
      page: "profile-phone",
    },
    blocks: [
      {
        type: "profile-phone",
        name: "Profile Phone",
        props: [
          {
            type: "text",
            id: "title",
            value: "Phone Number",
          },
        ],
      },
    ],
  },
  {
    canvas: {
      value: "right_side",
      label: "Right Panel",
    },
    attributes: {
      page: "profile-phone",
    },
  },
]);

export default ProfilePhone;
