import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useLocation } from "react-router-dom";
import { isLoggedIn } from "../helper/auth-guard";
import { useSeoMeta, useThemeConfig } from "../helper/hooks";
import ProfileRoot from "../components/profile/profile-root";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";

function OrdersList({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();

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
    page?.value === "orders-list" && (
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
            className="basePageContainer margin0auto"
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

OrdersList.authGuard = isLoggedIn;
export const sections = JSON.stringify([
  {
    canvas: {
      value: "left_side",
      label: "Left Panel",
    },
    attributes: {
      page: "orders-list",
    },
    blocks: [
      {
        type: "profile-orders",
        name: "Profile Orders",
        props: [
          {
            type: "text",
            id: "title",
            value: "My Orders",
          },
          {
            type: "checkbox",
            id: "show_empty_state",
            value: true,
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
      page: "orders-list",
    },
  },
]);

export default OrdersList;
