import React, { useState, useMemo, useEffect } from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import InfiniteLoader from "../components/infinite-loader/infinite-loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";

function Home({ numberOfSections, fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { isEdit = false } = useGlobalStore(fpi.getters.CUSTOM_VALUE);
  const { globalConfig, pageConfig } = useThemeConfig({ fpi, page: "home" });
  const seoData = page?.seo || {};
  const { sections = [], error, isLoading } = page || {};
  const initialSectionsCount = globalConfig?.initial_sections_count || 3;

  const [visibleCount, setVisibleCount] = useState(initialSectionsCount);
  const { brandName, canonicalUrl, pageUrl, trimDescription, socialImage } =
    useSeoMeta({ fpi, seo: seoData });

  const title = useMemo(() => {
    const baseTitle = sanitizeHTMLTag(
      seoData?.title || brandName || t("resource.common.page_titles.home")
    );
    return baseTitle ? `${baseTitle} - Official Online Store` : "";
  }, [seoData?.title, brandName, t]);

  const renderSections = useMemo(
    () => (isEdit ? sections : sections?.slice(0, visibleCount)),
    [sections, visibleCount]
  );
  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || t("resource.common.home_seo_description")
    );
    return trimDescription(raw, 160);
  }, [seoData?.description, t, trimDescription]);

  useEffect(() => {
    // Skip on server-side
    if (typeof window === "undefined") return;

    const showAllSections = () => {
      setVisibleCount(sections.length);
      window?.removeEventListener("scroll", handleScroll);
      // Mark that home sections have been loaded in this session
      try {
        sessionStorage.setItem("home_sections_loaded", "true");
      } catch (e) {
        // Ignore sessionStorage errors (e.g., private browsing)
      }
    };

    const handleScroll = () => {
      showAllSections();
    };

    // Check if home sections were loaded before in this session (handles SPA back navigation)
    let hasLoadedBefore = false;
    try {
      hasLoadedBefore =
        sessionStorage.getItem("home_sections_loaded") === "true";
    } catch (e) {
      // Ignore sessionStorage errors
    }

    // Check if user has already scrolled
    const hasScrolled = window.scrollY > 0;

    if (hasLoadedBefore || hasScrolled) {
      // Immediately show all sections on return visit or if already scrolled
      showAllSections();
      return;
    }

    // Add scroll listener for first visit
    window?.addEventListener("scroll", handleScroll);

    return () => {
      window?.removeEventListener("scroll", handleScroll);
    };
  }, [sections]);

  if (error) {
    return (
      <>
        <h1>{t("resource.common.error_occurred")}</h1>
        <pre>{JSON.stringify(error, null, 4)}</pre>
      </>
    );
  }

  return (
    <>
      {getHelmet({
        title,
        description,
        image: socialImage,
        canonicalUrl,
        url: pageUrl,
        siteName: brandName,
        ogType: "website",
      })}
      <div className="margin0auto basePageContainer">
        <h1 className="visually-hidden">{title}</h1>
        {page?.value === "home" && (
          <SectionRenderer
            sections={renderSections || sections}
            fpi={fpi}
            globalConfig={globalConfig}
          />
        )}
        {isLoading && <Loader />}
      </div>
    </>
  );
}

export const settings = JSON.stringify({
  props: [],
});

export const sections = JSON.stringify([
  {
    attributes: {
      page: "home",
    },
  },
]);

export default Home;
