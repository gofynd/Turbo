import React, { useState, useMemo, useEffect } from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import Loader from "../components/loader/loader";
import InfiniteLoader from "../components/infinite-loader/infinite-loader";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";

function Home({ numberOfSections, fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { isEdit = false } = useGlobalStore(fpi.getters.CUSTOM_VALUE);
  const { globalConfig } = useThemeConfig({ fpi });
  const seoData = page?.seo || {};
  const title = sanitizeHTMLTag(seoData?.title || "Home");
  const { sections = [], error, isLoading } = page || {};
  const [visibleCount, setVisibleCount] = useState(3);

  const renderSections = useMemo(
    () => (isEdit ? sections : sections?.slice(0, visibleCount)),
    [sections, visibleCount]
  );
  const description = sanitizeHTMLTag(
    seoData?.description || t("resource.common.home_seo_description")
  );
  const mergedSeo = { ...seoData, title, description };

  useEffect(() => {
    const handleScroll = () => {
      setVisibleCount(sections.length);
      window?.removeEventListener("scroll", handleScroll);
    };

    window?.addEventListener("scroll", handleScroll);

    return () => window?.removeEventListener("scroll", handleScroll);
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
      {getHelmet({ seo: mergedSeo })}
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
