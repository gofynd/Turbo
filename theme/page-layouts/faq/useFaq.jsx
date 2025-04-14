import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import { FAQ_CATEGORIES, FAQS_BY_CATEGORY } from "../../queries/faqQuery";

const useFaq = ({ fpi }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [activeFaqCat, setActiveFaqCat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const slug = searchParams.get("category");
  const [isFaqCateoryLoading, setIsFaqCateoryLoading] = useState(false);
  const [faqs, setFaqs] = useState(null);

  const { categories: faqCategories } =
    useGlobalStore(fpi?.getters?.FAQ_CATEGORIES) ?? {};
  const FAQS = useGlobalStore(fpi?.getters?.FAQS) ?? {};

  useEffect(() => {
    setIsLoading(true);
    fpi.executeGQL(FAQ_CATEGORIES).then(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    setFaqs(FAQS.faqs);
  }, [FAQS.faqs]);

  const defaultFaqCategory = () => {
    if (faqCategories?.length) {
      const defaultSlug = faqCategories?.[0]?.slug ?? "";
      setIsFaqCateoryLoading(true);
      setActiveFaqCat(
        faqCategories?.find((i) => i.slug === defaultSlug) ?? null
      );
      fpi.executeGQL(FAQS_BY_CATEGORY, { slug: defaultSlug }).then(() => {
        setIsFaqCateoryLoading(false);
      });
    }
  };

  useEffect(() => {
    if (!slug) {
      defaultFaqCategory();
    }
  }, [faqCategories]);

  useEffect(() => {
    if (slug) {
      setIsFaqCateoryLoading(true);
      setActiveFaqCat(faqCategories?.find((i) => i.slug === slug) ?? null);
      fpi.executeGQL(FAQS_BY_CATEGORY, { slug }).then(() => {
        setIsFaqCateoryLoading(false);
      });
    }
  }, [location.search, faqCategories]);

  const updateSearchParams = ({ key = "category", value, action }) => {
    if (action === "delete") {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }

    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: false,
    });
  };

  return {
    faqCategories,
    activeFaqCat,
    faqs,
    setFaqs,
    updateSearchParams,
    hasCatQuery: !!searchParams.get("category"),
    isLoading: isLoading || isFaqCateoryLoading,
    defaultFaqCategory,
  };
};

export default useFaq;
