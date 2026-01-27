import React, { useMemo } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { SectionRenderer } from "fdk-core/components";
import { getHelmet } from "../providers/global-provider";
import styles from "../styles/sections/product-description.less";
import { sanitizeHTMLTag, sanitizeMetaDescription } from "../helper/utils";

function ProductDescription({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);
  const seo = PRODUCT?.product_details?.seo || {};
  const productDescription =
    PRODUCT?.product_details?.description ||
    PRODUCT?.product_meta?.short_description;
  const productName = PRODUCT?.product_details?.name || "";
  const productImage =
    PRODUCT?.product_details?.media?.[0]?.secure_url ||
    PRODUCT?.product_details?.media?.[0]?.url ||
    "";
  const { brandName, canonicalUrl, pageUrl, description: seoDescription, socialImage } =
    useSeoMeta({
      fpi,
      seo: { ...seo, image: seo?.image || productImage },
      fallbackImage: productImage,
    });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(seo?.title || productName);
    return raw && brandName ? `${raw} | ${brandName}` : raw || brandName || "";
  }, [seo?.title, productName, brandName]);

  const description = useMemo(() => {
    const rawSeoDesc = sanitizeHTMLTag(seo?.description || "");
    const rawProductDesc = sanitizeMetaDescription(productDescription || "");
    const rawTitle = sanitizeHTMLTag(title || "");
    const rawBrandName = sanitizeHTMLTag(brandName || "");
    
    const raw = rawSeoDesc || rawProductDesc || rawTitle || rawBrandName || "";
    return raw;
  }, [seo?.description, productDescription, title, brandName]);

  return (
    <>
      {getHelmet({
        title,
        description,
        image: socialImage,
        canonicalUrl,
        url: pageUrl,
        siteName: brandName,
        ogType: "product",
      })}
      <div
        className={`${styles.productDescWrapper} basePageContainer margin0auto`}
      >
        {page?.value === "product-description" && (
          <SectionRenderer
            sections={sections}
            fpi={fpi}
            globalConfig={globalConfig}
          />
        )}
      </div>
      {/* Note: Do not remove the below empty div, it is required to insert sticky add to cart at the bottom of the sections */}
      <div id="sticky-add-to-cart" className={styles.stickyAddToCart}></div>
    </>
  );
}

export const sections = JSON.stringify([
  {
    attributes: {
      page: "product-description",
    },
  },
]);

export default ProductDescription;
