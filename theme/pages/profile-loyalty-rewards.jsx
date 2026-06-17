import React from "react";
import { motion } from "framer-motion";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
import { isLoggedIn } from "../helper/auth-guard";
import { useThemeConfig } from "../helper/hooks";
import ProfileRoot from "../components/profile/profile-root";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";

function ProfileLoyaltyRewards({ fpi, forceRender = false }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const pageSections = page?.sections || [];
  const resolvedSections = pageSections.length
    ? pageSections
    : DEFAULT_SECTIONS;

  // Filter sections by canvas
  const leftSections = resolvedSections.filter(
    (section) => (section.canvas?.value || section.canvas) === "left_side"
  );
  const rightSections = resolvedSections.filter(
    (section) => (section.canvas?.value || section.canvas) === "right_side"
  );

  return (
    (forceRender || page?.value === "profile-loyalty-rewards") && (
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

ProfileLoyaltyRewards.authGuard = isLoggedIn;

export const sections = JSON.stringify([
  {
    canvas: {
      value: "left_side",
      label: "Left Panel",
    },
    attributes: {
      page: "profile-loyalty-rewards",
    },
    blocks: [
      {
        type: "profile-loyalty-rewards",
        name: "Profile Loyalty Rewards",
        props: [
          {
            type: "text",
            id: "title",
            value: "Loyalty Rewards",
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
      page: "profile-loyalty-rewards",
    },
    blocks: [
      {
        type: "profile-navigation-menu",
        name: "Profile Navigation Menu",
        props: [],
      },
    ],
  },
]);

const DEFAULT_SECTIONS = JSON.parse(sections);

export default ProfileLoyaltyRewards;
