import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { isLoggedIn } from "../helper/auth-guard";
import ProfileRoot from "../components/profile/profile-root";
import ProfileDetailsPage from "../page-layouts/profile/profile-details-page";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";

function ProfileDetails({ fpi }) {
  const { brandName, canonicalUrl, pageUrl, trimDescription, socialImage } =
    useSeoMeta({ fpi, seo: {} });

  const title = useMemo(() => {
    const base = brandName ? `My Account – ${brandName}` : "My Account";
    return sanitizeHTMLTag(base);
  }, [brandName]);

  const description = useMemo(() => {
    const base =
      brandName && brandName.length
        ? `Manage your account, profile, and settings on ${brandName}.`
        : "Manage your account, profile, and settings.";
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
      >
        <ProfileDetailsPage fpi={fpi} />
      </motion.div>
    </ProfileRoot>
  );
}

ProfileDetails.authGuard = isLoggedIn;

export const sections = JSON.stringify([]);

export default ProfileDetails;
