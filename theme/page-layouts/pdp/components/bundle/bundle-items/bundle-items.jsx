import React from "react";
import styles from "./bundle-items.less";
import useLocaleDirection from "../../../../../helper/hooks/useLocaleDirection";
import ProductCardMini from "../product-card/product-card";
import { FDKLink } from "fdk-core/components";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../../../../components/carousel/carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { Skeleton } from "../../../../../components/core/skeletons";

export default function BundleItems({
  products,
  isLoading,
  isBrand,
  currencySymbol,
  globalConfig,
}) {
  const { direction } = useLocaleDirection();

  if (isLoading) {
    return (
      <>
        <div className={styles.bundleItemsTitle}>
          <Skeleton width="50%" />
        </div>
        <Carousel
          opts={{
            active: false,
          }}
          className={styles.carouselContainer}
        >
          <CarouselContent className={styles.carouselContent}>
            <CarouselItem className={styles.bundleProductCard}>
              <ProductCardMini isLoading />
            </CarouselItem>
            <CarouselItem className={styles.bundleProductCard}>
              <ProductCardMini isLoading />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </>
    );
  }

  if (!products?.length) return null;

  return (
    <>
      <div className={styles.bundleItemsTitle}>
        Product in the combo <span>{`(${products?.length} Products)`}</span>
      </div>
      <Carousel
        className={styles.carouselContainer}
        opts={{
          active: products.length > 1,
          align: "start",
          loop: false,
          skipSnaps: true,
          direction,
        }}
        plugins={[WheelGesturesPlugin()]}
      >
        <CarouselContent className={styles.carouselContent}>
          {products?.map(
            ({
              brand,
              price,
              price_effective,
              media,
              size,
              name,
              action,
              slug,
            }) => {
              const { url = "" } = media?.[0] || {};
              return (
                <CarouselItem className={styles.bundleProductCard} key={slug}>
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
                    draggable={false}
                  >
                    <ProductCardMini
                      globalConfig={globalConfig}
                      isBrand={isBrand}
                      brand={brand.name}
                      title={name}
                      imageUrl={url}
                      effectivePrice={price_effective}
                      markedPrice={price}
                      currencySymbol={currencySymbol}
                      size={size}
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
