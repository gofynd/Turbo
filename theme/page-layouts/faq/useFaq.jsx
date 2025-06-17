import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import { FAQ_CATEGORIES, FAQS_BY_CATEGORY } from "../../queries/faqQuery";
import { isRunningOnClient } from "../../helper/utils";

const useFaq = ({ fpi }) => {
  const isClient = useMemo(() => isRunningOnClient(), []);
  const location = isClient ? useLocation() : null;
  const navigate = isClient ? useNavigate() : null;
  const customValue = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const searchParams = isClient ? new URLSearchParams(location.search) : null;
  const [activeFaqCat, setActiveFaqCat] = useState(
    customValue["activeFaqCategories"]
  );
  const [isLoading, setIsLoading] = useState(false);
  const slug = isClient ? searchParams.get("category") : null;
  const [isFaqCateoryLoading, setIsFaqCateoryLoading] = useState(false);

  const { categories: faqCategories } =
    useGlobalStore(fpi?.getters?.FAQ_CATEGORIES) ?? {};
  const FAQS = useGlobalStore(fpi?.getters?.FAQS) ?? {};
  const [faqs, setFaqs] = useState(FAQS?.faqs);
  useEffect(() => {
    if (isClient && !customValue["activeFaqCategories"]) {
      setIsLoading(true);
      fpi.executeGQL(FAQ_CATEGORIES).then((res) => {
        setIsLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      setFaqs(FAQS.faqs);
    }
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
    if (isClient) {
      if (!slug && !customValue["activeFaqCategories"]) {
        defaultFaqCategory();
      }
    }
  }, [faqCategories]);

  useEffect(() => {
    if (slug && isClient && activeFaqCat?.slug !== slug) {
      setIsFaqCateoryLoading(true);
      setActiveFaqCat(faqCategories?.find((i) => i.slug === slug) ?? null);
      fpi.executeGQL(FAQS_BY_CATEGORY, { slug }).then(() => {
        setIsFaqCateoryLoading(false);
      });
    }
  }, [slug, faqCategories]);

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
    hasCatQuery: !!slug,
    isLoading: isLoading || isFaqCateoryLoading,
    defaultFaqCategory,
  };
};

export default useFaq;
