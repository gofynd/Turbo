import React from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { translateDynamicLabel } from "../../../../../helper/utils";
import {
  PRODUCT_DETAILS_WITH_SIZE,
  ADD_TO_CART,
} from "../../../../../queries/pdpQuery";
import styles from "./product-bundles.less";
import useLocaleDirection from "../../../../../helper/hooks/useLocaleDirection";
import ProductComboCard from "../product-combo-card/product-combo-card";
import { FDKLink } from "fdk-core/components";
import { useSnackbar } from "../../../../../helper/hooks";
import { fetchCartDetails } from "../../../../cart/useCart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../../../../components/carousel/carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { Skeleton } from "../../../../../components/core/skeletons";

export default function ProductBundles({
  fpi,
  isLoading,
  bundles,
  currencySymbol,
  globalConfig,
}) {
  console.log({ bundles, isLoading });
  const { t } = useGlobalTranslation("translation");
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const { direction } = useLocaleDirection();
  const { showSnackbar } = useSnackbar();

  function getQty(productDetails) {
    const moq = productDetails?.moq || false;

    if (moq) {
      return moq?.minimum ?? 1;
    }
  }

  const handleAddToCartClick = (slug, size) => async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!slug || !size) {
      return;
    }

    const payload = {
      slug,
      size,
      pincode: locationDetails?.pincode?.toString() || "",
    };
    try {
      const { data, errors } = await fpi.executeGQL(
        PRODUCT_DETAILS_WITH_SIZE,
        payload,
        { skipStoreUpdate: true }
      );
      if (errors) {
        throw errors;
      }
      const productDetails = data?.product;
      const fulfillmentOptions =
        data?.productsPriceWithFulfillmentOption?.items || [];

      const currentFulfillmentOption =
        fulfillmentOptions.find(
          (foItem) => foItem?.fulfillment_option?.is_default
        ) || fulfillmentOptions[0];

      if (currentFulfillmentOption) {
        const payload = {
          buyNow: false,
          areaCode: locationDetails?.pincode?.toString() || "",
          addCartRequestInput: {
            items: [
              {
                article_assignment: {
                  level: `${currentFulfillmentOption?.article_assignment?.level}`,
                  strategy: `${currentFulfillmentOption?.article_assignment?.strategy}`,
                },
                article_id: currentFulfillmentOption?.article_id?.toString(),
                item_id: productDetails?.uid,
                item_size: size?.toString(),
                quantity: getQty(productDetails),
                seller_id: currentFulfillmentOption?.seller?.uid,
                store_id: currentFulfillmentOption?.store?.uid,
                fulfillment_option_slug:
                  currentFulfillmentOption?.fulfillment_option?.slug || "",
              },
            ],
          },
        };
        const { data: addToCartData, errors: addToCartErrors } =
          await fpi.executeGQL(ADD_TO_CART, payload);
        if (addToCartErrors || !addToCartData?.addItemsToCart?.success) {
          throw (
            translateDynamicLabel(addToCartErrors?.[0]?.message, t) ||
            t("resource.common.add_cart_failure")
          );
        }
        fetchCartDetails(fpi);
        showSnackbar(
          translateDynamicLabel(addToCartData?.addItemsToCart?.message, t) ||
            t("resource.common.add_to_cart_success"),
          "success"
        );
      }
    } catch (error) {
      showSnackbar(error, "error");
    }
  };

  if (isLoading) {
    return (
      <>
        <div className={styles.bundleTitle}>
          <Skeleton width="60%" />
        </div>
        <Carousel
          opts={{
            active: false,
          }}
          className={styles.bundleContainer}
        >
          <CarouselContent>
            <CarouselItem className={styles.bundleCard}>
              <ProductComboCard isLoading />
            </CarouselItem>
            <CarouselItem className={styles.bundleCard}>
              <ProductComboCard isLoading />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </>
    );
  }

  if (!bundles?.length) return null;

  return (
    <>
      <div className={styles.bundleTitle}>
        {bundles.length === 1
          ? `This Product is a part of ${bundles?.[0]?.name} Combo`
          : `This Product is a part of ${bundles.length} Combo options`}
      </div>
      <Carousel
        className={styles.bundleContainer}
        opts={{
          active: bundles.length > 1,
          align: "start",
          loop: false,
          skipSnaps: true,
          direction,
        }}
        plugins={[WheelGesturesPlugin()]}
      >
        <CarouselContent>
          {bundles?.map(
            ({
              brand,
              price,
              price_effective,
              media,
              size,
              name,
              slug,
              action,
            }) => {
              const { url = "" } = media?.[0] || {};
              return (
                <CarouselItem className={styles.bundleCard} key={slug}>
                  <FDKLink
                    action={{
                      ...action,
                      page: {
                        ...action.page,
                        query: {
                          ...action.page.query,
                          ...(size && { size }),
                        },
                      },
                    }}
                    draggable="false"
                  >
                    <ProductComboCard
                      globalConfig={globalConfig}
                      isBrand={true}
                      brand={brand.name}
                      title={name}
                      imageUrl={url}
                      effectivePrice={price_effective}
                      markedPrice={price}
                      currencySymbol={currencySymbol}
                      size={size}
                      onAddToCartClick={handleAddToCartClick(slug, size)}
                    />
                  </FDKLink>
                </CarouselItem>
              );
            }
          )}
        </CarouselContent>
      </Carousel>
    </>
  );
}
