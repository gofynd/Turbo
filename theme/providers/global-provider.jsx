import React, { useMemo, useEffect, useState } from "react";
import Values from "values.js";
import { useLocation, useSearchParams } from "react-router-dom";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import { Helmet } from "react-helmet-async";
import {
  getProductImgAspectRatio,
  isRunningOnClient,
  sanitizeHTMLTag,
} from "../helper/utils";
import { useThemeConfig } from "../helper/hooks";
import useInternational from "../components/header/useInternational";
import { fetchCartDetails } from "../page-layouts/cart/useCart";

export function ThemeProvider({ children }) {
  const fpi = useFPI();
  const location = useLocation();
  const locationDetails = useGlobalStore(fpi.getters.LOCATION_DETAILS);
  const seoData = useGlobalStore(fpi.getters.CONTENT)?.seo?.seo?.details;
  const title = sanitizeHTMLTag(seoData?.title);
  const description = sanitizeHTMLTag(seoData?.description);
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  let domainUrl =
    CONFIGURATION?.application?.domains?.find((d) => d.is_primary)?.name || "";
  if (domainUrl && !/^https?:\/\//i.test(domainUrl)) {
    domainUrl = `https://${domainUrl}`;
  }
  const image = sanitizeHTMLTag(
    seoData?.image ||
      seoData?.image_url ||
      CONFIGURATION?.application?.logo?.secure_url ||
      ""
  );
  const canonicalPath = sanitizeHTMLTag(seoData?.canonical_url);
  const { defaultCurrency } = useGlobalStore(fpi.getters.CUSTOM_VALUE);
  const sellerDetails = JSON.parse(
    useGlobalStore(fpi.getters.SELLER_DETAILS) || "{}"
  );
  const { globalConfig, pallete } = useThemeConfig({ fpi });
  const { i18nDetails, countryDetails, fetchCountrieDetails } =
    useInternational({ fpi });

  const [searchParams] = useSearchParams();
  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");

  const fontStyles = useMemo(() => {
    let styles = "";
    const headerFont = globalConfig.font_header;
    const bodyFont = globalConfig.font_body;
    const headerFontName = headerFont?.family;
    const headerFontVariants = headerFont?.variants;

    const bodyFontName = bodyFont?.family;
    const bodyFontVariants = bodyFont?.variants;

    if (headerFontName) {
      Object.keys(headerFontVariants).forEach((variant) => {
        const fontStyles = `
          @font-face {
            font-family: ${headerFontName};
            src: local(${headerFontName}),
              url(${headerFontVariants[variant].file});
            font-weight: ${headerFontVariants[variant].name};
            font-display: swap;
          }
        `;

        styles = styles.concat(fontStyles);
      });

      const customFontClasses = `
        .fontHeader {
          font-family: ${headerFontName} !important;
        }
      `;

      styles = styles.concat(customFontClasses);
    }

    if (bodyFontName) {
      Object.keys(bodyFontVariants).forEach((variant) => {
        const fontStyles = `
          @font-face {
            font-family: ${bodyFontName};
            src: local(${bodyFontName}),
              url(${bodyFontVariants[variant].file});
            font-weight: ${bodyFontVariants[variant].name};
            font-display: swap;
          }
        `;

        styles = styles.concat(fontStyles);
      });

      const customFontClasses = `
        .fontBody {
          font-family: ${bodyFontName} !important;
        }
      `;

      styles = styles.concat(customFontClasses);
    }

    const buttonPrimaryShade = new Values(pallete.button.button_primary);
    const buttonLinkShade = new Values(pallete.button.button_link);
    const accentDarkShades = new Values(pallete.theme.theme_accent).shades(20);
    const accentLightShades = new Values(pallete.theme.theme_accent).tints(20);
    styles = styles.concat(
      `:root, ::before, ::after {
        --font-body: ${bodyFontName};
        --font-header: ${headerFontName};
        --section-bottom-padding: ${globalConfig?.section_margin_bottom}px;
        --imageRadius: ${globalConfig?.image_border_radius}px;
        --badgeRadius: ${globalConfig?.badge_border_radius ?? 24}px;
        --buttonRadius: ${globalConfig?.button_border_radius}px;
        --productImgAspectRatio: ${getProductImgAspectRatio(globalConfig)};
        --buttonPrimaryL1: #${buttonPrimaryShade.tint(20).hex};
        --buttonPrimaryL3: #${buttonPrimaryShade.tint(60).hex};
        --buttonLinkL1: #${buttonLinkShade.tint(20).hex};
        --buttonLinkL2: #${buttonLinkShade.tint(40).hex};
        --page-max-width: ${globalConfig?.enable_page_max_width ? "1440px" : "unset"};
        ${accentDarkShades?.reduce((acc, color, index) => acc.concat(`--themeAccentD${index + 1}: #${color.hex};`), "")}
        ${accentLightShades?.reduce((acc, color, index) => acc.concat(`--themeAccentL${index + 1}: #${color.hex};`), "")}
      }`
    );
    return styles.replace(/\s+/g, "");
  }, [globalConfig]);

  const fontLinks = useMemo(() => {
    const links = [];
    const addedDomains = new Set(); // Track added domains
    const fonts = [
      {
        font: globalConfig.font_header,
        keyPrefix: "header",
        variant: "semi_bold",
      },
      {
        font: globalConfig.font_body,
        keyPrefix: "body",
        variant: "regular",
      },
    ];

    const addFontLinks = ({ font, keyPrefix, variant }) => {
      if (font?.variants) {
        const fontUrl = font.variants[variant].file;
        let fontDomain;
        try {
          fontDomain = fontUrl ? new URL(fontUrl).origin : "";
        } catch (error) {
          fontDomain = ""; // Fallback to an empty string or handle as needed
        }
        if (!addedDomains.has(fontDomain)) {
          links.push(
            <link
              key={`preconnect-${keyPrefix}-${links.length}`}
              rel="preconnect"
              href={fontDomain}
            />
          );
          addedDomains.add(fontDomain); // Mark domain as added
        }

        links.push(
          <link
            key={`${keyPrefix}-${links.length}`}
            rel="preload"
            href={fontUrl}
            as="font"
            crossOrigin="anonymous"
          />
        );
      }
    };

    fonts.forEach(addFontLinks); // Add links for both header and body fonts
    return links;
  }, [globalConfig]);

  useEffect(() => {
    if (globalConfig?.show_quantity_control) {
      fetchCartDetails(fpi, { buyNow });
    }
  }, [globalConfig?.show_quantity_control]);

  // to scroll top whenever path changes
  useEffect(() => {
    return () =>
      setTimeout(() => {
        window?.scrollTo?.(0, 0);
      }, 0);
  }, [location?.pathname]);

  useEffect(() => {
    if (
      !locationDetails?.country_iso_code ||
      !i18nDetails?.currency?.code ||
      !i18nDetails?.countryCode
    ) {
      fpi.setI18nDetails({
        currency: { code: i18nDetails?.currency?.code || defaultCurrency },
        countryCode: sellerDetails.country_code,
      });
    }
  }, []);

  useEffect(() => {
    if (
      i18nDetails?.countryCode &&
      i18nDetails?.countryCode !== countryDetails?.iso2
    ) {
      fetchCountrieDetails({ countryIsoCode: i18nDetails?.countryCode });
    }
  }, [i18nDetails?.countryCode]);

  return (
    <>
      <Helmet>
        {fontLinks}
        <style type="text/css">{fontStyles}</style>
        <title>{title}</title>
        <meta name="og:title" content={title} />
        <meta name="twitter:title" content={title} />
        <meta name="description" content={description} />
        <meta name="og:description" content={description} />
        <meta name="twitter:description" content={description} />
        <meta name="image" content={image} />
        <meta name="og:image" content={image} />
        <meta name="twitter:image" content={image} />
        <meta name="og:url" content={domainUrl} />
        <meta name="og:type" content="website" />
        {canonicalPath && <link rel="canonical" href={canonicalPath} />}
      </Helmet>
      {children}
    </>
  );
}

export const getHelmet = ({ seo }) => {
  const title = sanitizeHTMLTag(seo?.title);
  const description = sanitizeHTMLTag(seo?.description);
  const image = sanitizeHTMLTag(seo?.image ? seo?.image : seo?.image_url);
  const canonicalPath = sanitizeHTMLTag(seo?.canonical_url);
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      <meta name="description" content={description} />
      <meta name="og:description" content={description} />
      <meta name="twitter:description" content={description} />
      <meta name="image" content={image} />
      <meta name="og:image" content={image} />
      <meta name="twitter:image" content={image} />
      <meta name="og:type" content="website" />
      {canonicalPath && <link rel="canonical" href={canonicalPath} />}
    </Helmet>
  );
};
