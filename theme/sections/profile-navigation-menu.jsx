import React, { Fragment, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ALL_PROFILE_MENU } from "../helper/constant";
import { FDKLink } from "fdk-core/components";
import { useGlobalTranslation, useGlobalStore, useFPI } from "fdk-core/utils";
import { useAccounts } from "../helper/hooks";
import { getConfigFromProps } from "../helper/utils";
import LogoutModal from "../components/profile/logout-modal";
import styles from "../styles/profile-navigation-menu.less";

// Import icon components
import OrdersIcon from "../assets/images/orders.svg";
import CallIcon from "../assets/images/call.svg";
import EmailIcon from "../assets/images/email.svg";
import AddressIcon from "../assets/images/address.svg";
import CardIcon from "../assets/images/card.svg";
import ReferNearnIcon from "../assets/images/refernearn.svg";
import WishlistIcon from "../assets/images/wishlist.svg";

// Icon mapping
const iconMap = {
  orders: OrdersIcon,
  call: CallIcon,
  email: EmailIcon,
  address: AddressIcon,
  card: CardIcon,
  refernearn: ReferNearnIcon,
  wishlist: WishlistIcon,
};

const DEFAULT_BLOCKS = [
  { type: "user-info", props: {} },
  { type: "account-heading", props: {} },
  { type: "profile-menu", props: {} },
  { type: "sign-out", props: {} },
];

export function Component({ props, blocks = [], preset, globalConfig }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
  const { pathname, search } = useLocation();
  const { first_name, last_name, profile_pic_url, user } = useGlobalStore(
    fpi.getters.USER_DATA
  );
  const { signOut } = useAccounts({ fpi });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const userName =
    `${first_name ?? user?.first_name ?? ""} ${last_name ?? user?.last_name ?? ""}`.trim();

  const userProfilePicUrl = profile_pic_url ?? user?.profile_pic_url;

  // Get initials from first name and last name
  const getInitials = () => {
    const firstName = first_name ?? user?.first_name ?? "";
    const lastName = last_name ?? user?.last_name ?? "";
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}` || "U";
  };

  // Check if we have names available for initials
  const hasNames = () => {
    const firstName = first_name ?? user?.first_name ?? "";
    const lastName = last_name ?? user?.last_name ?? "";
    return firstName.trim() !== "" || lastName.trim() !== "";
  };

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

  const resolvedBlocks = blocks?.length ? blocks : DEFAULT_BLOCKS;

  // Clear sessionStorage when directly navigating to orders pages
  useEffect(() => {
    if (
      pathname === "/profile/orders" &&
      !pathname.startsWith("/profile/orders/")
    ) {
      // Clear sessionStorage when on orders list page (not order details)
      try {
        sessionStorage.removeItem("orderDetailsSource");
      } catch (e) {
        // sessionStorage not available, ignore
      }
    }
  }, [pathname]);

  // Check if a menu item is active based on current location
  const isMenuItemActive = (link) => {
    const currentLocation = `${pathname}${search}`;

    // Helper function to safely get sessionStorage value
    const getOrderSource = () => {
      try {
        return sessionStorage.getItem("orderDetailsSource");
      } catch (e) {
        return null;
      }
    };

    // If link has query parameters, match the full location
    if (link.includes("?")) {
      // Special handling for "My Returns" link (/profile/orders?status=4)
      if (link === "/profile/orders?status=4") {
        // If we're on order details page, check if we came from returns
        if (pathname.startsWith("/profile/orders/")) {
          // Check sessionStorage to see if we came from returns page
          const orderSource = getOrderSource();
          return orderSource === "returns";
        }
        return currentLocation === link;
      }
      return currentLocation === link;
    }

    // If link has no query parameters, match pathname only
    // But ensure it's not matching a link with query params (e.g., /profile/orders should not match /profile/orders?status=4)
    if (pathname === link) {
      // Special case: if we're on /profile/orders with status=4, don't highlight "My Orders"
      if (link === "/profile/orders" && search.includes("status=4")) {
        return false;
      }
      return true;
    }

    // Special handling for "My Orders": highlight when on any order-related page
    // This includes order details pages like /profile/orders/shipment/{shipmentId}
    if (link === "/profile/orders" && pathname.startsWith("/profile/orders/")) {
      // Don't highlight if we're on the returns page (status=4)
      if (search.includes("status=4")) {
        return false;
      }
      // Check if we came from returns page - if so, don't highlight "My Orders"
      const orderSource = getOrderSource();
      if (orderSource === "returns") {
        return false;
      }
      return true;
    }

    return false;
  };

  const renderMenuItems = (blockConfig) => {
    const menuItems = ALL_PROFILE_MENU.filter(({ key }) => {
      // Check if this menu item should be shown (default to true if not specified)
      const showKey = `show_${key}`;
      return blockConfig?.[showKey] !== false;
    });

    if (!menuItems.length) {
      return null;
    }

    return (
      <ul>
        {menuItems.map(({ key, display, link, icon }) => {
          const IconComponent = iconMap[icon];
          const isActive = isMenuItemActive(link);
          return (
            <li
              className={`${styles.nav} ${isActive ? styles.selected : ""}`}
              key={key}
            >
              <FDKLink className={styles.flexAlignCenter} to={link}>
                <span className={styles.menuIcon}>
                  {IconComponent && <IconComponent />}
                </span>
                <span className={styles.itemTitle}>{t(display)}</span>
              </FDKLink>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <div className={styles.navContainer}>
        {resolvedBlocks.map((block, index) => {
          const key = `${block?.type || "block"}_${index}`;
          const blockConfig = getConfigFromProps(block?.props || {});

          switch (block?.type) {
            case "user-info": {
              const shouldShowImage = blockConfig?.hide_profile_image !== true;
              const showEditLink = blockConfig?.show_edit_link !== false;
              const editLinkText =
                blockConfig?.edit_link_label ||
                t("resource.profile.edit_profile");
              const editLinkUrl = blockConfig?.edit_link || "/profile/details";

              return (
                <div key={key} className={styles.userData}>
                  {shouldShowImage && (
                    <div className={styles.defaultImage}>
                      {hasNames() ? (
                        <div className={styles.initialsAvatar}>
                          {getInitials()}
                        </div>
                      ) : (
                        <img
                          className={styles.accountIcon}
                          src={userProfilePicUrl}
                          alt={t("resource.common.user_alt")}
                        />
                      )}
                    </div>
                  )}
                  <div className={styles.nameContainer}>
                    <p title={userName} className={styles.name}>
                      {userName}
                    </p>
                    {showEditLink && (
                      <FDKLink
                        className={styles.flexAlignCenter}
                        to={editLinkUrl}
                      >
                        <p className={styles.editLink}>{editLinkText}</p>
                      </FDKLink>
                    )}
                  </div>
                </div>
              );
            }
            case "account-heading": {
              const headingText =
                blockConfig?.heading_text || t("resource.profile.my_account");

              if (blockConfig?.hide_heading === true) {
                return null;
              }

              return (
                <div key={key} className={styles.accountHeader}>
                  {headingText}
                </div>
              );
            }
            case "profile-menu":
              return (
                <Fragment key={key}>{renderMenuItems(blockConfig)}</Fragment>
              );
            case "sign-out": {
              if (blockConfig?.hide_sign_out) {
                return null;
              }
              const signOutLabel =
                blockConfig?.button_label || t("resource.profile.sign_out");
              return (
                <div key={key} className={styles.versionContainer}>
                  <div className={styles.signOut} onClick={handleSignOut}>
                    {signOutLabel}
                  </div>
                </div>
              );
            }
            default:
              return null;
          }
        })}
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}

export const settings = {
  label: "Profile Navigation Menu",
  props: [],
  blocks: [
    {
      type: "user-info",
      name: "User Info",
      limit: 1,
      props: [
        {
          type: "checkbox",
          id: "hide_profile_image",
          label: "Hide Profile Image",
          default: false,
        },
        {
          type: "checkbox",
          id: "show_edit_link",
          label: "Show Edit Link",
          default: true,
        },
        {
          type: "text",
          id: "edit_link_label",
          label: "Edit Link Label",
          default: "",
        },
        {
          type: "url",
          id: "edit_link",
          label: "Edit Link URL",
          default: "/profile/details",
        },
      ],
    },
    {
      type: "account-heading",
      name: "Account Heading",
      limit: 1,
      props: [
        {
          type: "text",
          id: "heading_text",
          label: "Heading Text",
          default: "",
        },
        {
          type: "checkbox",
          id: "hide_heading",
          label: "Hide Heading",
          default: false,
        },
      ],
    },
    {
      type: "profile-menu",
      name: "Menu Items",
      props: [
        {
          type: "checkbox",
          id: "show_orders",
          label: "Show Orders",
          default: true,
        },
        {
          type: "checkbox",
          id: "show_phone",
          label: "Show Phone Number",
          default: true,
        },
        {
          type: "checkbox",
          id: "show_email",
          label: "Show Email Address",
          default: true,
        },
        {
          type: "checkbox",
          id: "show_address",
          label: "Show My Address",
          default: true,
        },
        {
          type: "checkbox",
          id: "show_returned_orders",
          label: "Show My Returns",
          default: true,
        },
        {
          type: "checkbox",
          id: "show_wishlist",
          label: "Show My Wishlist",
          default: true,
        },
      ],
    },
    {
      type: "sign-out",
      name: "Sign Out",
      limit: 1,
      props: [
        {
          type: "text",
          id: "button_label",
          label: "Button Label",
          default: "",
        },
        {
          type: "checkbox",
          id: "hide_sign_out",
          label: "Hide Button",
          default: false,
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        type: "user-info",
        props: {},
      },
      {
        type: "account-heading",
        props: {},
      },
      {
        type: "profile-menu",
        props: {},
      },
      {
        type: "sign-out",
        props: {},
      },
    ],
  },
};

export default Component;
