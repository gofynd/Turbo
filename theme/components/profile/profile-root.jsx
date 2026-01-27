import React, { useState, useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useAccounts } from "../../helper/hooks";
import useSeoMeta from "../../helper/hooks/useSeoMeta";
import { sanitizeHTMLTag } from "../../helper/utils";
import ProfileNavigation from "@gofynd/theme-template/components/profile-navigation/profile-navigation";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";
import { getHelmet } from "../../providers/global-provider";
import LogoutModal from "./logout-modal";

function ProfileRoot({
  children,
  fpi,
  leftSections = [],
  rightSections = [],
  globalConfig,
}) {
  const { first_name, last_name, profile_pic_url, user } = useGlobalStore(
    fpi.getters.USER_DATA
  );
  const { signOut } = useAccounts({ fpi });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const userName =
    `${first_name ?? user?.first_name ?? ""} ${last_name ?? user?.last_name ?? ""}`.trim();

  const userProfilePicUrl = profile_pic_url ?? user?.profile_pic_url;
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
  const handleSignOut = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    signOut();
    setIsLogoutModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
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
      <ProfileNavigation
        userName={userName}
        signOut={handleSignOut}
        userProfilePicUrl={userProfilePicUrl}
        leftSections={leftSections}
        rightSections={rightSections}
        fpi={fpi}
        globalConfig={globalConfig}
      >
        {children}
      </ProfileNavigation>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}

export default ProfileRoot;
