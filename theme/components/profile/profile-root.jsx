import React from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useAccounts } from "../../helper/hooks";
import useSeoMeta from "../../helper/hooks/useSeoMeta";
import { useMemo } from "react";
import { sanitizeHTMLTag } from "../../helper/utils";
import ProfileNavigation from "@gofynd/theme-template/components/profile-navigation/profile-navigation";
import "@gofynd/theme-template/components/profile-navigation/profile-navigation.css";
import { getHelmet } from "../../providers/global-provider";

function ProfileRoot({ children, fpi }) {
  const { first_name, last_name, profile_pic_url, user } = useGlobalStore(
    fpi.getters.USER_DATA
  );
  const { signOut } = useAccounts({ fpi });

  const userName =
    `${first_name ?? user?.first_name ?? ""} ${last_name ?? user?.last_name ?? ""}`.trim();

  const userProfilePicUrl = profile_pic_url ?? user?.profile_pic_url;
  const { t } = useGlobalTranslation("translation");
  const { brandName, canonicalUrl, pageUrl, trimDescription, socialImage } =
    useSeoMeta({ fpi, seo: {} });

  const title = useMemo(() => {
    const base = brandName ? `My Account | ${brandName}` : "My Account";
    return sanitizeHTMLTag(base);
  }, [brandName]);

  const description = useMemo(() => {
    const base = t("resource.profile_details.seo_description");
    return trimDescription(sanitizeHTMLTag(base), 160);
  }, [brandName, trimDescription]);
  return (
    <ProfileNavigation
      userName={userName}
      signOut={signOut}
      userProfilePicUrl={userProfilePicUrl}
    >
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
      {children}
    </ProfileNavigation>
  );
}

export default ProfileRoot;
