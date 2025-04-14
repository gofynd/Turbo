import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";
import styles from "./footer.less";
import useHeader from "../header/useHeader";
import SocialLinks from "../socail-media/socail-media";
import { useThemeConfig } from "../../helper/hooks";

function Footer({ fpi }) {
  const location = useLocation();
  const { globalConfig, FooterNavigation, contactInfo, supportInfo } =
    useHeader(fpi);
  const { email, phone } = supportInfo?.contact ?? {};
  const { active: emailActive = false, email: emailArray = [] } = email ?? {};
  const { active: phoneActive = false, phone: phoneArray = [] } = phone ?? {};
  const { pallete } = useThemeConfig({ fpi });

  const getArtWork = () => {
    if (globalConfig?.footer_image) {
      return {
        "--background-desktop": `url(${
          globalConfig?.footer_image_desktop ||
          "../../assets/images/placeholder19x6.png"
        })`,
        "--background-mobile": `url(${
          globalConfig?.footer_image_mobile ||
          "../../assets/images/placeholder4x5.png"
        })`,
        "--footer-opacity": 0.25,
        "--footer-opacity-background": `${pallete?.footer?.footer_bottom_background}40`, // The last two digits represents the opacity (0.25 is converted to hex)
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover ",
        backgroundPosition: "center",
      };
    }
    return {};
  };

  const getLogo = globalConfig?.logo?.replace("original", "resize-h:100");

  const isSocialLinks = Object.values(contactInfo?.social_links ?? {}).some(
    (value) => value?.link?.trim?.()?.length > 0
  );

  function hasOne() {
    return emailArray?.length || phoneArray?.length || isSocialLinks;
  }

  const isFooterHidden = useMemo(() => {
    const regex =
      /^\/refund\/order\/([^/]+)\/shipment\/([^/]+)$|^\/cart\/bag\/?$/;
    return regex.test(location?.pathname);
  }, [location?.pathname]);

  return (
    !isFooterHidden && (
      <footer className={`${styles.footer} fontBody`} style={getArtWork()}>
        <>
          <div className={styles.footer__top}>
            <div className={styles.footerContainer}>
              <div className={`${styles["footer__top--wrapper"]}`}>
                <div className={styles["footer__top--info"]}>
                  {getLogo?.length > 0 && (
                    <div className={styles.logo}>
                      <img
                        src={getLogo}
                        loading="lazy"
                        alt="Footer Logo"
                        fetchpriority="low"
                      />
                    </div>
                  )}
                  <p className={`${styles.description} b1 ${styles.fontBody}`}>
                    {globalConfig?.footer_description}
                  </p>
                </div>
                <div className={`${styles["footer__top--menu"]}`}>
                  {FooterNavigation?.map((item, index) => (
                    <div className={styles.linkBlock} key={index}>
                      <h5 className={`${styles.menuTitle} ${styles.fontBody}`}>
                        {item?.action?.page?.type === "external" ? (
                          <a
                            href={item?.action?.page?.query?.url[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.display}
                          </a>
                        ) : convertActionToUrl(item?.action)?.length > 0 ? (
                          <FDKLink to={convertActionToUrl(item?.action)}>
                            {item.display}
                          </FDKLink>
                        ) : (
                          <p>{item.display}</p>
                        )}
                      </h5>
                      <ul className={styles.list}>
                        {item?.sub_navigation?.map((subItem, subIndex) =>
                          subItem?.active ? (
                            <li
                              className={`${styles.menuItem} b1 ${styles.fontBody}`}
                              key={subIndex}
                            >
                              {subItem?.action?.page?.type === "external" ? (
                                <a
                                  href={subItem?.action?.page?.query?.url[0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {subItem.display}
                                </a>
                              ) : convertActionToUrl(subItem?.action)?.length >
                                0 ? (
                                <FDKLink
                                  to={convertActionToUrl(subItem?.action)}
                                >
                                  {subItem.display}
                                </FDKLink>
                              ) : (
                                <p>{subItem.display}</p>
                              )}
                            </li>
                          ) : null
                        )}
                      </ul>
                    </div>
                  ))}
                  {FooterNavigation?.length === 1 && (
                    <div className={styles.lineBlock} />
                  )}
                  {FooterNavigation?.length === 2 && (
                    <div className={styles.lineBlock} />
                  )}
                </div>
              </div>
              {hasOne() && (
                <div
                  className={`${styles["footer__top--contactInfo"]} ${globalConfig?.footer_contact_background ? "" : styles["footer__top--noBackground"]}`}
                >
                  {phoneActive && phoneArray?.[0]?.number && (
                    <div className={styles.list}>
                      <h5
                        className={`${styles.title} ${styles.contacts} ${styles.fontBody}`}
                      >
                        Contact Us
                      </h5>
                      <a
                        href={`tel:${phoneArray?.[0]?.number}`}
                        className={`${styles.detail} b1 ${styles.fontBody}`}
                      >
                        {`${
                          phoneArray?.[0]?.code
                            ? `+${phoneArray?.[0]?.code} -`
                            : ""
                        } ${phoneArray?.[0]?.number}`}
                      </a>
                    </div>
                  )}
                  {emailActive && emailArray?.[0]?.value && (
                    <div className={styles.list}>
                      <h5
                        className={`${styles.title} ${styles.contacts} ${styles.fontBody}`}
                      >
                        Email ID
                      </h5>
                      <a
                        href={`mailto:${emailArray?.[0]?.value}`}
                        className={`${styles.detail} b1 ${styles.fontBody}`}
                      >
                        {emailArray?.[0]?.value}
                      </a>
                    </div>
                  )}
                  <div className={styles.list}>
                    {isSocialLinks && (
                      <>
                        <h5
                          className={`${styles.title} ${styles.contacts} ${styles.fontBody}`}
                        >
                          Social Media
                        </h5>
                        <span>
                          <SocialLinks
                            social_links={contactInfo?.social_links}
                          />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.footer__bottom}>
            <div className={styles.footerContainer}>
              <div className={`${styles.copyright} b1 ${styles.fontBody}`}>
                {contactInfo?.copyright_text}
              </div>
              {globalConfig?.payments_logo && (
                <div className={styles.paymentLogo}>
                  <img
                    src={globalConfig?.payments_logo}
                    alt="Payment Logo"
                    loading="lazy"
                    fetchpriority="low"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      </footer>
    )
  );
}

export default Footer;
