import React, { useState, useMemo } from "react";
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
  const { globalConfig } = useThemeConfig({ fpi });
  const seoData = page?.seo || {};
  const title = sanitizeHTMLTag(seoData?.title || "Home");
  const { sections = [], error, isLoading } = page || {};
  const [step, setStep] = useState(0);
  const renderSections = useMemo(
    () => sections?.slice(0, 3 + step * 2),
    [sections, step]
  );
const description = sanitizeHTMLTag(seoData?.description || t("resource.common.home_seo_description"));
const mergedSeo = { ...seoData, title, description };

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
      <div>
        <h1 className="visually-hidden">{title}</h1>
        {page?.value === "home" && (
          <InfiniteLoader
            infiniteLoaderEnabled={true}
            loader={<></>}
            hasNext={renderSections.length !== sections.length}
            loadMore={() => {
              setStep((prev) => prev + 1);
            }}
          >
            <SectionRenderer
              sections={renderSections || sections}
              fpi={fpi}
              globalConfig={globalConfig}
            />
          </InfiniteLoader>
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
