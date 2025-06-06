import React, { useState, useEffect } from "react";
import useFaq from "../page-layouts/faq/useFaq";
import FaqPage from "@gofynd/theme-template/pages/faq";
import "@gofynd/theme-template/pages/faq/faq.css";
import EmptyState from "../components/empty-state/empty-state";
import EmptyFaqIcon from "../assets/images/no-faq.svg";
import { useGlobalTranslation } from "fdk-core/utils";

function Faqs({ fpi }) {
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

export const sections = JSON.stringify([]);

export default Faqs;
