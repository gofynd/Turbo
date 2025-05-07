import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";
import styles from "./footer.less";
import useHeader from "../header/useHeader";
import SocialLinks from "../socail-media/socail-media";
import { useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../../helper/hooks";

function Footer({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const { globalConfig, FooterNavigation, contactInfo, supportInfo } =
    useHeader(fpi);
  const { email, phone } = supportInfo?.contact ?? {};
  const { active: emailActive = false, email: emailArray = [] } = email ?? {};
  const { active: phoneActive = false, phone: phoneArray = [] } = phone ?? {};
  const { pallete } = useThemeConfig({ fpi });
  const [isMobile, setIsMobile] = useState(false);

  const isPDP = /^\/product\/[^/]+\/?$/.test(location.pathname); // ⬅️ PDP check

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(max-width: 767px)");
      setIsMobile(mq.matches);

      const handler = (e) => setIsMobile(e.matches);

      if (mq.addEventListener) {
        mq.addEventListener("change", handler);
      } else if (mq.addListener) {
        mq.addListener(handler);
      }

      return () => {
        if (mq.removeEventListener) {
          mq.removeEventListener("change", handler);
        } else if (mq.removeListener) {
          mq.removeListener(handler);
        }
      };
    }
  }, []);

  const getArtWork = () => {
    if (globalConfig?.footer_image) {
      return {
        "--background-desktop": `url(${globalConfig?.footer_image_desktop ||
          "../../assets/images/placeholder19x6.png"
          })`,
        "--background-mobile": `url(${globalConfig?.footer_image_mobile ||
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

  const footerStyle = {
    ...getArtWork(),
    ...(isMobile && isPDP ? { paddingBottom: "74px" } : {}),
  };

  const isFooterHidden = useMemo(() => {
    const regex =
      /^\/refund\/order\/([^/]+)\/shipment\/([^/]+)$|^\/cart\/bag\/?$|^\/cart\/checkout\/?$/;
    return regex.test(location?.pathname);
  }, [location?.pathname]);

  return (
    !isFooterHidden && (
      <footer className={`${styles.footer} fontBody`} style={footerStyle}>
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
                        alt={t("resource.footer.footer_logo_alt_text")}
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
                          <FDKLink action={item?.action}>
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
                                  action={subItem?.action}
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
                  className={`${styles["footer__top--contactInfo"]} ${globalConfig?.footer_contact_background !== false ? "" : styles["footer__top--noBackground"]}`}
                >
                  {emailActive && emailArray?.length > 0 && (
                    <div className={styles.listData}>
                      {emailArray.map((item, idx) => (
                        <div
                          className={styles.footerSupportData}
                          key={`email-${idx}`}
                        >
                          <h5
                            className={`${styles.title} ${styles.contacts} ${styles.fontBody}`}
                          >
                            {item?.key}
                          </h5>
                          <a
                            href={`mailto:${item?.value}`}
                            className={`${styles.detail} b1 ${styles.fontBody}`}
                          >
                            {item?.value}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  {phoneActive && phoneArray?.length > 0 && (
                    <div className={styles.listData}>
                      {phoneArray.map((item, idx) => (
                        <div
                          className={styles.footerSupportData}
                          key={`phone-${idx}`}
                        >
                          <h5
                            className={`${styles.title} ${styles.contacts} ${styles.fontBody}`}
                          >
                            {item?.key}
                          </h5>
                          <a
                            href={`tel:${item?.number}`}
                            className={`${styles.detail} b1 ${styles.fontBody}`}
                          >
                            {`${item?.code ? `+${item.code}-` : ""}${item?.number}`}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`${styles.list} ${styles.listSocial} `}>
                    {isSocialLinks && (
                      <>
                        <div className={`${styles.socialContainer}`}>
                          {globalConfig?.footer_social_text && (
                            <h5
                              className={`${styles.title} ${styles.socialTitle} ${styles.contacts} ${styles.fontBody}`}
                            >
                              {globalConfig?.footer_social_text}
                            </h5>
                          )}
                          <span>
                            <SocialLinks
                              social_links={contactInfo?.social_links}
                            />
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {contactInfo?.copyright_text && (
            <div className={styles.footer__bottom}>
              <div className={styles.footerContainer}>
                <div className={`${styles.copyright} b1 ${styles.fontBody}`}>
                  {contactInfo?.copyright_text}
                </div>
                {globalConfig?.payments_logo && (
                  <div className={styles.paymentLogo}>
                    <img
                      src={globalConfig?.payments_logo}
                      alt={t("resource.footer.payment_logo_alt_text")}
                      loading="lazy"
                      fetchpriority="low"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      </footer>
    )
  );
}

export default Footer;
