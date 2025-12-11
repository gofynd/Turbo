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
import { initializeCopilot } from "../../copilot";

export function ThemeProvider({ children }) {
  const fpi = useFPI();
  const location = useLocation();
  const locationDetails = useGlobalStore(fpi.getters.LOCATION_DETAILS);
  const seoData = useGlobalStore(fpi.getters.CONTENT)?.seo?.seo?.details;
  const title = sanitizeHTMLTag(seoData?.title);
  const description = sanitizeHTMLTag(seoData?.description);
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const sections = useGlobalStore(fpi.getters.PAGE)?.sections || [];
  const { globalConfig, pallete } = useThemeConfig({ fpi });
  const siteName = sanitizeHTMLTag(
    globalConfig?.site_name ||
      globalConfig?.brand_name ||
      CONFIGURATION?.application?.name ||
      CONFIGURATION?.app?.name
  );

  useEffect(() => {
    // Strict SSR check - only run in browser
    if (typeof window === "undefined") {
      return;
    }

    // Strict check - document must exist (should exist if window exists, but being safe)
    if (typeof document === "undefined") {
      return;
    }

    // Get Storefront Copilot Actions configuration
    const storefrontCopilotActions =
      globalConfig?.storefront_copilot_actions ?? false;

    // Auto-initialize copilot if window.copilot is available
    // Only register storefront actions if storefront_copilot_actions is enabled
    const initCopilot = () => {
      initializeCopilot({
        storefrontCopilotActions,
      }).catch(() => {
        // Silently handle errors
        // Errors are already handled within initializeCopilot
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initCopilot);
    } else {
      initCopilot();
    }
  }, [globalConfig?.storefront_copilot_actions]);

  let domainUrl =
    CONFIGURATION?.application?.domains?.find((d) => d.is_primary)?.name || "";
  if (domainUrl && !/^https?:\/\//i.test(domainUrl)) {
    domainUrl = `https://${domainUrl}`;
  }
  const baseUrl =
    domainUrl || (isRunningOnClient() ? window?.location?.origin : "");
  const image = sanitizeHTMLTag(
    seoData?.image ||
      seoData?.image_url ||
      CONFIGURATION?.application?.logo?.secure_url ||
      ""
  );
  const canonicalPath = sanitizeHTMLTag(seoData?.canonical_url);
  const canonicalUrl = canonicalPath
    ? /^https?:\/\//i.test(canonicalPath)
      ? canonicalPath
      : `${baseUrl}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`
    : baseUrl && location?.pathname
      ? `${baseUrl}${location.pathname}`
      : "";
  const resolvedImage =
    image && baseUrl && !/^https?:\/\//i.test(image)
      ? `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`
      : image;

  const { defaultCurrency } = useGlobalStore(fpi.getters.CUSTOM_VALUE);
  const sellerDetails = JSON.parse(
    useGlobalStore(fpi.getters.SELLER_DETAILS) || "{}"
  );
  const { i18nDetails, countryDetails, fetchCountrieDetails } =
    useInternational({ fpi });

  const [searchParams] = useSearchParams();
  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");

  const isValidSection =
    sections[0]?.name === "application-banner" ||
    sections[0]?.name === "image-slideshow" ||
    sections[0]?.name === "hero-image" ||
    sections[0]?.name === "image-gallery" ||
    sections[0]?.name === "hero-video";

  const headerPosition = useMemo(() => {
    if (
      globalConfig?.transparent_header &&
      globalConfig?.sticky_header &&
      isValidSection
    ) {
      return "fixed";
    } else if (globalConfig?.sticky_header && !isValidSection) {
      return "sticky ";
    } else if (!globalConfig?.sticky_header) {
      return "unset";
    } else {
      return "sticky ";
    }
  }, [globalConfig]);

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
        --header-position: ${headerPosition};
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
        // Check if current page is PLP or PDP related
        const currentPath = location?.pathname;
        const isPLPOrPDP =
          currentPath.startsWith("/product") ||
          currentPath === "/products" ||
          currentPath.startsWith("/products") ||
          currentPath.startsWith("/collection/") ||
          currentPath.startsWith("/brands/") ||
          currentPath.startsWith("/categories/");

        // If navigating away from PLP/PDP, clean up scroll states
        if (!isPLPOrPDP) {
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("plp_scroll_")) {
              sessionStorage.removeItem(key);
            }
          });
        }

        // Standard scroll to top behavior
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

  const content = (
    <>
      <Helmet>
        {fontLinks}
        <style type="text/css">{fontStyles}</style>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        {siteName && <meta property="og:site_name" content={siteName} />}
        {title && <meta property="og:title" content={title} />}
        <meta property="og:type" content="website" />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        {description && (
          <meta property="og:description" content={description} />
        )}
        {resolvedImage && (
          <>
            <meta name="image" content={resolvedImage} />
            <meta property="og:image" content={resolvedImage} />
            <meta property="og:image:secure_url" content={resolvedImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="628" />
          </>
        )}
        <meta name="twitter:card" content="summary_large_image" />
        {title && <meta name="twitter:title" content={title} />}
        {description && (
          <meta name="twitter:description" content={description} />
        )}
        {resolvedImage && <meta name="twitter:image" content={resolvedImage} />}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      </Helmet>
      {children}
    </>
  );

  return content;
}

export const getHelmet = ({
  seo = {},
  title: overrideTitle,
  description: overrideDescription,
  image: overrideImage,
  canonicalUrl: overrideCanonicalUrl,
  url: overrideUrl,
  siteName: overrideSiteName,
  robots: overrideRobots,
  ogType = "product",
}) => {
  const title = sanitizeHTMLTag(overrideTitle || seo?.title);
  
  const description = sanitizeHTMLTag(overrideDescription || seo?.description);
  const image = sanitizeHTMLTag(
    overrideImage || (seo?.image ? seo?.image : seo?.image_url)
  );
  const url = sanitizeHTMLTag(overrideUrl || seo?.url || seo?.canonical_url);
  const canonicalPath = sanitizeHTMLTag(
    overrideCanonicalUrl || seo?.canonical_url
  );
  const siteName = sanitizeHTMLTag(
    overrideSiteName || seo?.site_name || seo?.brand || title
  );
  const robots = sanitizeHTMLTag(overrideRobots || seo?.robots);
  const canonicalUrl = canonicalPath || url;
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {robots && <meta name="robots" content={robots} />}
      {siteName && <meta property="og:site_name" content={siteName} />}
      {/* Open Graph for product */}
      <meta property="og:type" content={ogType} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />

      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="628" />
      <meta name="image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
};
