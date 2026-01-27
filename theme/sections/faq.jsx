import React from "react";
import { useFPI, useGlobalTranslation } from "fdk-core/utils";
import FaqPage from "@gofynd/theme-template/pages/faq";
import "@gofynd/theme-template/pages/faq/faq.css";

import useFaq from "../page-layouts/faq/useFaq";
import EmptyState from "../components/empty-state/empty-state";
import EmptyFaqIcon from "../assets/images/no-faq.svg";
import { FAQ_CATEGORIES, FAQS_BY_CATEGORY } from "../queries/faqQuery";

export function Component() {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
  const faqProps = useFaq({ fpi });

  return (
    <FaqPage
      {...faqProps}
      EmptyStateComponent={(props) => (
        <EmptyState
          customClassName={props.customClassName}
          title={t("resource.faq.no_frequently_asked_questions_found")}
          Icon={<EmptyFaqIcon />}
          showButton={false}
        />
      )}
    />
  );
}

export const settings = {
  label: "FAQ",
  props: [],
  blocks: [],
};

Component.serverFetch = async ({ fpi, router }) => {
  try {
    const { filterQuery = {} } = router;
    const paramsValue = filterQuery?.category;
    const res = await fpi.executeGQL(FAQ_CATEGORIES);
    const faqCategories =
      res?.data?.applicationContent?.faq_categories?.categories;

    const defaultSlug = !paramsValue ? faqCategories[0]?.slug : paramsValue;
    const activeCategory =
      faqCategories.find((i) => i.slug === defaultSlug) ?? null;

    fpi.custom.setValue("activeFaqCategories", activeCategory);

    if (defaultSlug) {
      try {
        await fpi.executeGQL(FAQS_BY_CATEGORY, {
          slug: defaultSlug,
        });
      } catch (err) {
        fpi.custom.setValue(
          "faqError",
          `Error fetching FAQs: ${err?.message || err}`
        );
      }
    }
  } catch (err) {
    fpi.custom.setValue(
      "faqCategoryError",
      `Error fetching FAQ categories: ${err?.message || err}`
    );
  }
};

export default Component;
