import React, { useEffect } from "react";
import FyImage from "../../../../components/core/fy-image/fy-image";
import styles from "./product-variants.less";
import { isRunningOnClient } from "../../../../helper/utils";
import { FDKLink } from "fdk-core/components";
import { useGlobalTranslation } from "fdk-core/utils";
import CheckIcon from "../../../../assets/images/check.svg";

function ProductVariants({
  variants,
  product,
  currentSlug,
  globalConfig,
  preventRedirect = false,
  setSlug,
}) {
  const { t } = useGlobalTranslation("translation");
  const isProductSet = product.is_set;
  const getVariantSetText = () => (isProductSet ? t("resource.common.size") : t("resource.common.set"));
  const getProductLink = (item) => {
    return `/product/${item.slug}`;
  };

  const getImageURL = (item) => {
    if (Array.isArray(item.medias) && item.medias.length > 0) {
      return item.medias[0].url;
    }
    return "";
  };

  const isVariantSelected = (item) => {
    if (currentSlug) {
      return currentSlug?.includes(item.slug);
    } else if (isRunningOnClient()) {
      return window?.location?.pathname.includes(item.slug);
    }
  };

  const getSelectedVariantLabel = (item) => {
    const selectedVariant =
      item?.items?.find((variant) => isVariantSelected(variant)) || {};
    let selectedValue = "";

    if (["color", "image"].includes(item.display_type)) {
      selectedValue = selectedVariant?.color_name;
    } else {
      selectedValue = selectedVariant?.value;
    }

    return `${item.header ? `${item.header}: ` : ""}${selectedValue ? `${selectedValue} (${t("resource.common.selected")})` : ""
      }`;
  };

  return (
    <div className={styles.productVariants}>
      {variants?.length > 0 &&
        variants.map((item, type) => (
          <div key={item.header + type} className={styles.variantWrapper}>
            {item.key === "is_set" ? (
              item?.items.map((variant, index) =>
                isProductSet !== variant.value ? (
                  <div key={variant.slug + index}>
                    {t("resource.product.interested_in")} {getVariantSetText()}?
                    <button
                      type="button"
                      className={styles.uktLinks}
                      onClick={() => getProductLink(variant)}
                    >
                      {t("resource.facets.pick")} {getVariantSetText()}
                    </button>
                  </div>
                ) : null
              )
            ) : (
              <>
                {getSelectedVariantLabel(item) && (
                  <div className={`captionNormal ${styles.variantTitle}`}>
                    {getSelectedVariantLabel(item)}
                  </div>
                )}
                {item.display_type === "image" ? (
                  <div className={styles.variantContainer}>
                    {item?.items.map((variant, index) => (
                      <div
                        key={variant.slug + index}
                        className={`${styles.variantItemImage} ${isVariantSelected(variant) ? styles.selected : ""
                          } ${!variant.is_available ? styles.unavailable : ""}`}
                      >
                        <FDKLink to={getProductLink(variant)}>
                          <FyImage
                            src={getImageURL(variant)}
                            alt={variant?.name}
                            globalConfig={globalConfig}
                          />
                        </FDKLink>
                        <div
                          className={`${isVariantSelected(variant)
                            ? styles.selectedOverlay
                            : styles.overlay
                            }`}
                        ></div>
                        <span>
                          <CheckIcon className={styles.selectedIcon} />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {item?.display_type === "color" ? (
                  <div className={styles.variantContainer}>
                    {item?.items.map((variant) => (
                      <div
                        key={variant?.slug}
                        className={`${styles.variantItemColor} ${isVariantSelected(variant) ? styles.selected : ""
                          }`}
                      >
                        <FDKLink
                          to={getProductLink(variant)}
                          title={variant.color_name}
                        >
                          <div
                            style={{
                              background: `#${variant.color}`,
                            }}
                            className={`${styles.color} ${isVariantSelected(variant) ? styles.selected : ""
                              } ${!variant.is_available ? styles.unavailable : ""
                              }`}
                          >
                            <div
                              className={`${isVariantSelected(variant)
                                ? styles.selectedOverlay
                                : styles.overlay
                                }`}
                            >
                              <span />
                            </div>
                            <CheckIcon className={styles.selectedIcon} />
                          </div>
                        </FDKLink>
                      </div>
                    ))}
                  </div>
                ) : null}
                {item?.display_type === "text" ? (
                  <div className={styles.variantContainer}>
                    {item?.items.map((variant, index) => (
                      <div
                        key={variant.slug + index}
                        className={`${styles.variantItemText} b2 ${isVariantSelected(variant) ? styles.selected : ""
                          } ${!variant.is_available ? styles.unavailable : ""}`}
                      >
                        {!preventRedirect ? (
                          <FDKLink to={getProductLink(variant)}>
                            <div>{variant?.value}</div>
                          </FDKLink>
                        ) : (
                          <div onClick={() => setSlug(variant?.slug)}>
                            {variant?.value}
                          </div>
                        )}
                        <span />
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ))}
    </div>
  );
}

export default ProductVariants;
