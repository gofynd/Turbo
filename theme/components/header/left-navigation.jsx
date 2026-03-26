import React, { useEffect, useMemo, useState } from "react";
import { FDKLink } from "fdk-core/components";
import { useGlobalTranslation } from "fdk-core/utils";
import navStyles from "./styles/navigation.less";
import styles from "./styles/left-navigation.less";
import HamburgerIcon from "../../assets/images/hamburger.svg";
import CloseIcon from "../../assets/images/close.svg";
import ArrowDownIcon from "../../assets/images/arrow-down.svg";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";

function LeftNavigation({ navigationList = [], triggerClassName = "" }) {
  const { t } = useGlobalTranslation("translation");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const hasNavigation = Array.isArray(navigationList) && navigationList.length;
  const activeItem =
    hasNavigation &&
    activeIndex !== null &&
    activeIndex >= 0 &&
    activeIndex < navigationList.length &&
    navigationList[activeIndex]
      ? navigationList[activeIndex]
      : null;

  const groupedNav = useMemo(() => {
    if (!activeItem?.sub_navigation?.length) return [];

    const columnCount = activeItem?.image ? 4 : 5;
    const result = Array.from({ length: columnCount }, () => []);

    activeItem.sub_navigation.forEach((item, index) => {
      const groupIndex = index % columnCount;
      result[groupIndex].push(item);
    });

    return result;
  }, [activeItem]);

  const l2NavItems = useMemo(
    () => activeItem?.sub_navigation || [],
    [activeItem]
  );

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" || event.key === "Esc") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("remove-scroll");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("remove-scroll");
    };
  }, [isOpen]);

  if (!hasNavigation) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={`${navStyles.icon} ${styles.leftNavTrigger} ${triggerClassName}`}
        onClick={() => {
          setIsOpen(true);
          setActiveIndex(null);
        }}
        aria-label={t("resource.header.open_navigation")}
      >
        <HamburgerIcon
          className={`${navStyles.hamburgerIcon} ${navStyles.menuIcon}`}
        />
      </button>

      {isOpen && (
        <div
          className={styles.leftNavOverlay}
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setIsOpen(false);
            setActiveIndex(null);
          }}
        >
          <div
            className={styles.leftNavContainer}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.leftNavBody}>
              <div className={styles.leftPanel}>
                <div className={styles.leftPanelHeader}>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={() => {
                      setIsOpen(false);
                      setActiveIndex(null);
                    }}
                    aria-label={t("resource.facets.close_alt")}
                  >
                    <CloseIcon
                      className={`${navStyles.menuIcon} ${styles.closeIcon}`}
                    />
                  </button>
                </div>
                <ul className={styles.leftPanelNav}>
                  {navigationList.map((item, index) => {
                    const isActive = index === activeIndex;
                    const hasChildren = !!item?.sub_navigation?.length;

                    const content = item?.action ? (
                      <FDKLink
                        action={item.action}
                        className={styles.leftPanelNavLink}
                      >
                        {item.display}
                      </FDKLink>
                    ) : (
                      <span className={styles.leftPanelNavLink}>
                        {item.display}
                      </span>
                    );

                    return (
                      <li
                        key={`${item.display}_${index}`}
                        className={`${styles.leftPanelNavItem} ${
                          isActive ? styles.leftPanelNavItemActive : ""
                        }`}
                        onMouseEnter={() =>
                          hasChildren
                            ? setActiveIndex(index)
                            : setActiveIndex(null)
                        }
                        onClick={() => {
                          setIsOpen(false);
                          setActiveIndex(null);
                        }}
                      >
                        {content}
                        {hasChildren && (
                          <ArrowDownIcon
                            className={`${navStyles.arrowRightIcon} ${navStyles.menuIcon}`}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {activeItem?.sub_navigation?.length ? (
                <div className={styles.leftNavRightPanel}>
                  <div className={styles.leftNavColumns}>
                    {l2NavItems.map((l2Menu, l2Index) => (
                      <div
                        key={`${l2Menu.display}_${l2Index}`}
                        className={styles.leftNavBlock}
                      >
                        <FDKLink
                          action={l2Menu?.action}
                          className={styles.leftNavL2Item}
                          onClick={() => {
                            setIsOpen(false);
                            setActiveIndex(null);
                          }}
                        >
                          <NavLogo nav={l2Menu} />
                          <div className={styles.leftNavL2Text}>
                            {l2Menu.display}
                          </div>
                        </FDKLink>
                        {!!l2Menu?.sub_navigation?.length && (
                          <div className={styles.leftNavL3List}>
                            {l2Menu.sub_navigation.map((l3Menu, l3Index) => (
                              <FDKLink
                                key={`${l3Menu.display}_${l3Index}`}
                                action={l3Menu?.action}
                                className={styles.leftNavL3Item}
                                onClick={() => {
                                  setIsOpen(false);
                                  setActiveIndex(null);
                                }}
                              >
                                <NavLogo nav={l3Menu} />
                                <div className={styles.leftNavL3Text}>
                                  {l3Menu.display}
                                </div>
                              </FDKLink>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const NavLogo = ({ nav }) => {
  const logo = nav?.image?.replace("original", "resize-w:50");

  if (!nav?.image) {
    return null;
  }

  return (
    <img
      className={styles.leftNavLogo}
      src={logo}
      alt={nav.display}
      loading="lazy"
      fetchpriority="low"
    />
  );
};

export default LeftNavigation;
