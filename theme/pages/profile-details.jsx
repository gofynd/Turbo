import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useGlobalStore } from "fdk-core/utils";
import { isLoggedIn } from "../helper/auth-guard";
import { useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import ProfileRoot from "../components/profile/profile-root";
import ProfileDetailsPage from "../page-layouts/profile/profile-details-page";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import { Helmet } from "react-helmet-async";

function ProfileDetails({ fpi }) {
    const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
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

  // Filter sections by canvas
  const leftSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "left_side"
  );
  const rightSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "right_side"
  );

  return (
    page?.value === "profile-details" && (
      <>
        {getHelmet({
          title,
          description,
          image: socialImage,
          canonicalUrl,
          url: pageUrl,
          siteName: brandName,
          ogType: "website",
        })}
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
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
            <ProfileDetailsPage fpi={fpi} />
          </motion.div>
        </ProfileRoot>
      </>
    )
  );
}

ProfileDetails.authGuard = isLoggedIn;

export const sections = JSON.stringify([
  {
    canvas: {
      value: "left_side",
      label: "Left Panel",
    },
    attributes: {
      page: "profile-details",
    },
    blocks: [
      {
        type: "profile-details-form",
        name: "Profile Details Form",
        props: [
          {
            type: "text",
            id: "title",
            value: "Profile Details",
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
      page: "profile-details",
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

export default ProfileDetails;
