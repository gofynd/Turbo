import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import { isLoggedIn } from "../helper/auth-guard";
import { useSeoMeta, useThemeConfig } from "../helper/hooks";
import ProfileRoot from "../components/profile/profile-root";
import { sanitizeHTMLTag } from "../helper/utils";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";
import { getHelmet } from "../providers/global-provider";

function ProfileAddress({ fpi }) {
  const { t } = useGlobalTranslation("translation");

  const { brandName, canonicalUrl, pageUrl, description: seoDescription, socialImage } =
    useSeoMeta({ fpi, seo: {} });

  const title = useMemo(() => {
    const base = brandName ? `My Account | ${brandName}` : "My Account";
    return sanitizeHTMLTag(base);
  }, [brandName]);

  const description = useMemo(() => {
    const base = t("resource.profile_details.seo_description");
    return (
      sanitizeHTMLTag(base).replace(/\s+/g, " ").trim() || seoDescription
    );
  }, [t, seoDescription]);

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
    page?.value === "profile-address" && (
      <>
        {getHelmet({
          title,
          description,
          image: socialImage,
          canonicalUrl,
          url: pageUrl,
          siteName: brandName,
          robots: "noindex, nofollow",
          ogType: "website",
        })}
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
      </>
    )
  );
}

ProfileAddress.authGuard = isLoggedIn;

export const sections = JSON.stringify([
  {
    canvas: {
      value: "left_side",
      label: "Left Panel",
    },
    attributes: {
      page: "profile-address",
    },
    blocks: [
      {
        type: "profile-address",
        name: "Profile Addresses",
        props: [
          {
            type: "text",
            id: "title",
            value: "My Addresses",
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
      page: "profile-address",
    },
  },
]);

export default ProfileAddress;
