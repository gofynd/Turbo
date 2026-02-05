import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { isLoggedIn } from "../helper/auth-guard";
import { useThemeConfig } from "../helper/hooks";
import ProfileRoot from "../components/profile/profile-root";
import { getHelmet } from "../providers/global-provider";
import { sanitizeHTMLTag } from "../helper/utils";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";

function WishlistPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};

  const seoData = page?.seo || {};
  const { brandName, canonicalUrl, pageUrl, description: seoDescription, socialImage } =
    useSeoMeta({ fpi, seo: seoData });
  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.title || t("resource.common.page_titles.wishlist")
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName, t]);
  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || t("resource.wishlist.seo_description")
    );
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [seoData?.description, t, seoDescription]);

  // Filter sections by canvas
  const leftSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "left_side"
  );
  const rightSections = sections.filter(
    (section) => (section.canvas?.value || section.canvas) === "right_side"
  );

  return (
    page?.value === "wishlist" && (
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

WishlistPage.authGuard = isLoggedIn;

export const settings = JSON.stringify({
  props: [
    {
      type: "checkbox",
      id: "show_add_to_cart",
      label: "t:resource.pages.wishlist.show_add_to_cart",
      info: "t:resource.common.not_applicable_international_websites",
      default: true,
    },
    {
      type: "text",
      id: "card_cta_text",
      label: "t:resource.common.button_text",
      default:
        "t:resource.settings_schema.cart_and_button_configuration.add_to_cart",
    },
    {
      type: "checkbox",
      id: "mandatory_pincode",
      label: "t:resource.common.show_hide_mandatory_delivery_check",
      info: "t:resource.pages.wishlist.show_hide_mandatory_delivery_check_info",
      default: true,
    },
    {
      type: "checkbox",
      id: "hide_single_size",
      label: "t:resource.common.hide_single_size",
      info: "t:resource.pages.wishlist.hide_single_size_info",
      default: false,
    },
    {
      type: "checkbox",
      id: "preselect_size",
      label: "t:resource.common.preselect_size",
      info: "t:resource.pages.wishlist.preselect_size_info",
      default: false,
    },
  ],
});

export const sections = JSON.stringify([
  {
    canvas: {
      value: "left_side",
      label: "Left Panel",
    },
    attributes: {
      page: "wishlist",
    },
    blocks: [
      {
        type: "profile-wishlist",
        name: "Profile Wishlist",
        props: [
          {
            type: "text",
            id: "title",
            value: "My Wishlist",
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
      page: "wishlist",
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

export default WishlistPage;
