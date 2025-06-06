import React, { useMemo } from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import styles from "./styles/mega-menu-large.less";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import ArrowDownIcon from "../../assets/images/arrow-down.svg";

function MegaMenuLarge({ headerNavigation, l1MenuClassName = "" }) {
  return (
    <div className={`${styles.headerNavigation}`}>
      {headerNavigation.map((menu, index) => (
        <div
          key={index}
          link={menu.link}
          className={`${styles.navigationItem}`}
        >
          <div className={`${styles.l1Category} ${l1MenuClassName}`}>
            <h5 className={`${styles.l1CategoryHeading}`}>
              <FDKLink action={menu?.action}>{menu.display}</FDKLink>
            </h5>
            {!!menu?.sub_navigation?.length && (
              <ArrowDownIcon
                className={`${styles.menuIcon} ${styles.dropdownIcon}`}
              />
            )}
          </div>
          <Megamenu navigation={menu} />
        </div>
      ))}
    </div>
  );
}

const Megamenu = ({ navigation }) => {
  const fpi = useFPI();
  const { themeHeaderHeight = 0 } = useGlobalStore(fpi.getters.CUSTOM_VALUE);
  const groupedNav = useMemo(() => {
    const column = !!navigation?.image ? 4 : 5;
    const result = Array.from({ length: column }, () => []);

    navigation?.sub_navigation?.forEach((item, index) => {
      const groupIndex = index % column;
      result[groupIndex].push(item);
    });

    return result;
  }, [navigation?.sub_navigation, navigation?.image]);

  if (!navigation?.sub_navigation?.length) {
    return null;
  }

  const dynamicStyles = {
    "--theme-header-height": `${themeHeaderHeight}px`,
  };

  return (
    <div className={styles.megamenuWrapper} style={dynamicStyles}>
      <div className={styles.megamenuContainer}>
        <div className={styles.megamenuContent}>
          <div className={`${styles.l2Container}`}>
            {groupedNav.map((l2Navigation, index) => (
              <div key={`col_${index}`} className={styles.l2Column}>
                {l2Navigation.map((l2Menu, l2index) => (
                  <div
                    key={`${l2Menu.display}_${l2index}`}
                    className={`${styles.l2NavigationBlock}`}
                  >
                    <FDKLink
                      action={l2Menu?.action}
                      className={`${styles.l2NavigationItem}`}
                    >
                      <NavLogo nav={l2Menu} />
                      <div className={`${styles.l2NavigationText}`}>
                        {l2Menu.display}
                      </div>
                    </FDKLink>
                    {!!l2Menu?.sub_navigation?.length && (
                      <div className={`${styles.l3NavigationBlock}`}>
                        {l2Menu?.sub_navigation.map((l3Menu, l3index) => (
                          <FDKLink
                            key={`${l3Menu.display}_${l3index}`}
                            action={l3Menu?.action}
                            className={`${styles.l3NavigationItem}`}
                          >
                            <NavLogo nav={l3Menu} />
                            <div className={`${styles.l3NavigationText}`}>
                              {l3Menu.display}
                            </div>
                          </FDKLink>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {!!navigation?.image && (
            <div className={styles.navigationImage}>
              <FDKLink action={navigation?.action}>
                <FyImage
                  src={navigation.image}
                  sources={[
                    { breakpoint: { min: 1728 }, width: 725 },
                    { breakpoint: { min: 1512 }, width: 634 },
                    { breakpoint: { min: 1296 }, width: 542 },
                    { breakpoint: { min: 1080 }, width: 447 },
                    { breakpoint: { min: 900 }, width: 370 },
                    { breakpoint: { min: 720 }, width: 294 },
                    { breakpoint: { min: 540 }, width: 50 },
                    { breakpoint: { min: 360 }, width: 50 },
                    { breakpoint: { min: 180 }, width: 50 },
                  ]}
                  defer={true}
                  alt={navigation?.display}
                  isFixedAspectRatio={false}
                />
              </FDKLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NavLogo = ({ nav }) => {
  const logo = nav?.image?.replace("original", "resize-w:50");

  if (!nav?.image) {
    return null;
  }

  return (
    <img
      className={styles.navLogo}
      src={logo}
      alt={nav.display}
      loading="lazy"
      fetchpriority="low"
    />
  );
};

export default MegaMenuLarge;
