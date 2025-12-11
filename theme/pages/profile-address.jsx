import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useGlobalTranslation } from "fdk-core/utils";
import { isLoggedIn } from "../helper/auth-guard";
import ProfileRoot from "../components/profile/profile-root";
import ProfileAddressPage from "../page-layouts/profile-address/profile-address-page";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";

function ProfileAddress({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const { brandName, canonicalUrl, pageUrl, trimDescription, socialImage } =
    useSeoMeta({ fpi, seo: {} });

  const title = useMemo(() => {
    const base = brandName ? `My Account | ${brandName}` : "My Account";
    return sanitizeHTMLTag(base);
  }, [brandName]);

  const description = useMemo(() => {
    const base = t("resource.profile_details.seo_description")
    return trimDescription(sanitizeHTMLTag(base), 160);
  }, [brandName, trimDescription]);

  return (
    <ProfileRoot fpi={fpi}>
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
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
        initial="hidden"
        animate="visible"
        style={{ height: "100%" }}
      >
        <ProfileAddressPage fpi={fpi} />
      </motion.div>
    </ProfileRoot>
  );
}

ProfileAddress.authGuard = isLoggedIn;

export default ProfileAddress;
