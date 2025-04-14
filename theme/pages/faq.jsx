import React from "react";
import useFaq from "../page-layouts/faq/useFaq";
import FaqPage from "@gofynd/theme-template/pages/faq";
import "@gofynd/theme-template/pages/faq/faq.css";
import EmptyState from "../components/empty-state/empty-state";
import EmptyFaqIcon from "../assets/images/no-faq.svg";

function Faqs({ fpi }) {
  const faqProps = useFaq({ fpi });

  return (
    <FaqPage
      {...faqProps}
      EmptyStateComponent={(props) => (
        <EmptyState
          customClassName={props.customClassName}
          title="No Frequently Asked Question"
          Icon={<EmptyFaqIcon />}
          showButton={false}
        />
      )}
    />
  );
}

export const sections = JSON.stringify([]);

export default Faqs;
