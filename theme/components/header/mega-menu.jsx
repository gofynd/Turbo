import React, { useState, useRef, useEffect } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./styles/mega-menu.less";
import ArrowDownIcon from "../../assets/images/arrow-down.svg";

function MegaMenu({ headerNavigation, l1MenuClassName = "" }) {
  const [searchQuery, setSarchQuery] = useState("");
  const l2Categories = useRef([]);
  const l2Category = useRef([]);
  const headerMegaMenu = useRef([]);

  useEffect(() => {
    setNavWidths();
    return () => { };
  }, []);

  const getPreciseOffsetWidth = (element) => {
    return Math.ceil(element?.getBoundingClientRect?.()?.width || 0);
  };
  const setNavWidths = () => {
    const parentMaxHeight = 520;

    const l2Parents = l2Categories.current;

    if (!l2Parents?.length) return;

    l2Parents.forEach((l2Child, index) => {
      let presentHeight = 0;
      let presentWidth = 0;
      let finalWidth = 0;
      const l2Children = l2Category.current[index];
      l2Children?.forEach((l2Grand, index) => {
        const l2GrandHeight = l2Grand.offsetHeight;
        const l2GrandWidth = getPreciseOffsetWidth(l2Grand);
        const isOnlyChild = l2Children.length === 1;
        const isLastGrandChild = index === l2Children.length - 1;
        const isExceedingMaxHeight =
          presentHeight + l2GrandHeight >= parentMaxHeight;

        if (!isExceedingMaxHeight) {
          if (isLastGrandChild) {
            if (finalWidth === 0) {
              finalWidth =
                l2GrandWidth > presentWidth ? l2GrandWidth : presentWidth;
            } else {
              finalWidth +=
                l2GrandWidth > presentWidth ? l2GrandWidth : presentWidth;
            }
          } else {
            presentHeight += l2GrandHeight;
            presentWidth =
              l2GrandWidth > presentWidth ? l2GrandWidth : presentWidth;
            if (isOnlyChild) {
              finalWidth = presentWidth;
            }
          }
        } else if (isExceedingMaxHeight) {
          finalWidth += presentWidth;
          presentHeight = l2GrandHeight;
          presentWidth = l2GrandWidth;
          if (isLastGrandChild) {
            finalWidth += presentWidth;
          }
        }
      });

      l2Child.style.width = `${finalWidth}px`;
      l2Child.style.maxWidth = "80vw";
      l2Child.style.overflowX = "auto";

      const toLeft = getToLeftPx(l2Child);
      if (toLeft) {
        l2Child.style.insetInlineStart = "auto";
        l2Child.style.insetInlineEnd = "0";
      } else {
        l2Child.style.insetInlineStart = "0";
      }
    });
  };
  const getToLeftPx = (child, parent = headerMegaMenu.current) => {
    if (!child || !parent) return;

    const [childLeft, childWidth, parentWidth] = [
      child.getBoundingClientRect().left,
      child.getBoundingClientRect().width,
      getPreciseOffsetWidth(parent) + 80,
    ];

    const isOverflowingFromViewport = childLeft + childWidth >= parentWidth;

    return isOverflowingFromViewport;
  };
  return (
    <div ref={headerMegaMenu} className={`${styles.headerMegaMenu}`}>
      <div className={`${styles.headerNavigation}`}>
        {headerNavigation?.map((menu, index) => (
          <div key={index}>
            <div link={menu.link} className={`${styles.navigationItem}`}>
              <div className={`${styles.l1Category} ${l1MenuClassName}`}>
                <h5 className={`${styles.l1CategoryHeading}`}>
                  <FDKLink action={menu?.action}>
                    {menu.display}
                  </FDKLink>
                </h5>
                {menu.sub_navigation && menu.sub_navigation.length > 0 && (
                  <ArrowDownIcon
                    className={`${styles.menuIcon} ${styles.dropdownIcon}`}
                  />
                )}
              </div>
              {menu?.sub_navigation?.length > 0 && (
                <div className={styles.l2CategoriesWrapper}>
                  <div
                    ref={(el) => {
                      l2Categories.current[index] = el;
                    }}
                    className={`${styles.l2Categories}`}
                  >
                    {menu?.sub_navigation.map((l2Menu, l2index) => (
                      <div
                        ref={(el) => {
                          if (!l2Category?.current?.[index]) {
                            l2Category.current[index] = [];
                          }
                          l2Category.current[index][l2index] = el;
                        }}
                        className={`${styles.l2Category}`}
                        key={l2index}
                      >
                        <FDKLink
                          action={l2Menu?.action}
                          className={`${styles.l2CategoryHeading}`}
                        >
                          <div className={`${styles.l2CategoryItem}`}>
                            {l2Menu.display}
                          </div>
                        </FDKLink>
                        {l2Menu?.sub_navigation?.length > 0 && (
                          <div className={`${styles.l3Category}`}>
                            {l2Menu?.sub_navigation.map((l3Menu, l3index) => (
                              <FDKLink
                                key={l3index}
                                action={l3Menu?.action}
                              >
                                <div className={`${styles.l3CategoryItem}`}>
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
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MegaMenu;
