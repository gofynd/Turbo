import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { FDKLink } from "fdk-core/components";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import { FEATURED_COLLECTION_PLACEHOLDER_PRODUCTS } from "../helper/constant";
import ProductCard from "@gofynd/theme-template/components/product-card/product-card";
import styles from "../styles/sections/featured-collection.less";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import { FEATURED_COLLECTION } from "../queries/collectionsQuery";
import "@gofynd/theme-template/components/product-card/product-card.css";
import placeholderBanner from "../assets/images/placeholder/featured-collection-banner.png";
import placeholderProduct from "../assets/images/placeholder/featured-collection-product.png";
import useAddToCartModal from "../page-layouts/plp/useAddToCartModal";
import {
  useViewport,
  useAccounts,
  useWishlist,
  useThemeFeature,
  useWindowWidth,
} from "../helper/hooks";
import { getProductImgAspectRatio } from "../helper/utils";
import "@gofynd/theme-template/page-layouts/plp/Components/size-guide/size-guide.css";
import "@gofynd/theme-template/page-layouts/plp/Components/add-to-cart/add-to-cart.css";
import useLocaleDirection from "../helper/hooks/useLocaleDirection";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../components/carousel";

const Modal = React.lazy(
  () => import("@gofynd/theme-template/components/core/modal/modal")
);
const AddToCart = React.lazy(
  () =>
    import(
      "@gofynd/theme-template/page-layouts/plp/Components/add-to-cart/add-to-cart"
    )
);
const SizeGuide = React.lazy(
  () =>
    import(
      "@gofynd/theme-template/page-layouts/plp/Components/size-guide/size-guide"
    )
);

export function Component({ props, globalConfig }) {
  const fpi = useFPI();
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const listingPrice =
    CONFIGURATION?.app_features?.common?.listing_price?.value || "range";
  const bannerRef = useRef(null);
  const isTablet = useViewport(0, 768);

  const addToCartConfigs = {
    mandatory_pincode: props.mandatory_pincode?.value,
    hide_single_size: props.hide_single_size?.value,
    preselect_size: props.preselect_size?.value,
  };
  const { isInternational } = useThemeFeature({ fpi });
  const addToCartModalProps = useAddToCartModal({
    fpi,
    pageConfig: addToCartConfigs,
  });
  const { isLoggedIn, openLogin } = useAccounts({ fpi });
  const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const { t } = useGlobalTranslation("translation");
  const {
    handleAddToCart,
    isOpen: isAddToCartOpen,
    showSizeGuide,
    handleCloseSizeGuide,
    ...restAddToModalProps
  } = addToCartModalProps;
  const {
    heading,
    description,
    item_count,
    mobile_layout,
    desktop_layout,
    img_fill,
    img_container_bg,
    button_text,
    button_position,
    collection,
    show_add_to_cart,
    card_cta_text,
    item_count_mobile,
    show_view_all,
    max_count,
    text_alignment,
    img_resize,
    img_resize_mobile,
    padding_top,
    padding_bottom,
  } = props;
  const itemCountMobile = Number(item_count_mobile?.value ?? 1);

  const [isLoading, setIsLoading] = useState(
    !!collection?.value ? true : false
  );

  const showAddToCart =
    !isInternational && show_add_to_cart?.value && !globalConfig?.disable_cart;
  const customValues = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const getGallery =
    customValues?.[`featuredCollectionData-${collection?.value}`]?.data
      ?.collection?.products?.items ?? [];
  const bannerUrl =
    customValues?.[`featuredCollectionData-${collection?.value}`]?.data
      ?.collection?.banners?.portrait?.url || placeholderBanner;
  const imgAlt =
    customValues?.[`featuredCollectionData-${collection?.value}`]?.data
      ?.collection?.banners?.portrait?.alt || "collection";
  const slug =
    customValues?.[`featuredCollectionData-${collection?.value}`]?.data
      ?.collection?.slug ?? "";
  const windowWidth = useWindowWidth();
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const i18nDetails = useGlobalStore(fpi.getters.i18N_DETAILS);
  const [isClient, setIsClient] = useState(false);

  const imagesForScrollView = useMemo(() => {
    if (!getGallery) return [];
    return getGallery.slice(0, max_count?.value);
  }, [getGallery, max_count?.value]);
  const { isRTL } = useLocaleDirection();

  const desktopCount = Number(item_count?.value ?? 4);
  const [breakpoint, setBreakpoint] = useState("desktop");

  useEffect(() => {
    const mqDesktop = window.matchMedia("(min-width: 780px)");
    const mqTablet = window.matchMedia(
      "(min-width: 480px) and (max-width: 779px)"
    );
    const update = () => {
      if (mqDesktop.matches) setBreakpoint("desktop");
      else if (mqTablet.matches) setBreakpoint("tablet");
      else setBreakpoint("mobile");
    };
    update();
    mqDesktop.addEventListener("change", update);
    mqTablet.addEventListener("change", update);
    return () => {
      mqDesktop.removeEventListener("change", update);
      mqTablet.removeEventListener("change", update);
    };
  }, []);

  const itemLength = imagesForScrollView.length;
  const showArrows = breakpoint === "desktop" && itemLength > desktopCount;
  const loop =
    itemLength >
    (breakpoint === "desktop"
      ? desktopCount
      : breakpoint === "tablet"
        ? 3
        : itemCountMobile);

  const config = useMemo(() => {
    if (breakpoint === "desktop") {
      return {
        align: "start",
        direction: isRTL ? "rtl" : "ltr",
        loop,
        draggable: true,
        containScroll: "trimSnaps",
        slidesToScroll: desktopCount,
        duration: 20,
      };
    }
    if (breakpoint === "tablet") {
      return {
        align: "start",
        direction: isRTL ? "rtl" : "ltr",
        loop,
        draggable: false,
        containScroll: "trimSnaps",
        slidesToScroll: 3,
        duration: 20,
      };
    }

    return {
      align: imagesForScrollView.length > itemCountMobile ? "center" : "start",
      direction: isRTL ? "rtl" : "ltr",
      loop: imagesForScrollView.length > itemCountMobile,
      draggable: true,
      containScroll: "trimSnaps",
      slidesToScroll: 1,
      duration: 20,
    };
  }, [
    breakpoint,
    isRTL,
    loop,
    desktopCount,
    itemCountMobile,
    imagesForScrollView.length,
  ]);

  let slideBasis = "100%";
  let viewportPadding = {};

  if (breakpoint === "desktop") {
    slideBasis = `${100 / (desktop_layout?.value === "banner_horizontal_scroll" ? 2.5 : Math.max(desktopCount, 1))}%`;
  } else if (breakpoint === "tablet") {
    slideBasis = `${100 / 3}%`;
  } else {
    slideBasis = `calc((100% - 38px) / ${Math.max(mobile_layout?.value === "banner_horizontal_scroll" ? 1 : itemCountMobile, 1)})`;
    viewportPadding = { paddingInline: "25px" };
  }

  const bannerConfig = useMemo(
    () => ({
      dots: false,
      speed: 500,
      slidesToShow: 2.5,
      slidesToScroll: 2,
      infinite: false,
      cssEase: "linear",
      arrows: false,
      centerMode: false,
      responsive: [
        {
          breakpoint: 780,
          settings: {
            arrows: false,
            dots: false,
            slidesToShow: 3,
            slidesToScroll: 3,
          },
        },
        {
          breakpoint: 500,
          settings: {
            dots: false,
            arrows: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: imagesForScrollView?.length > 1,
            centerMode: imagesForScrollView?.length > 1,
            centerPadding: "25px",
          },
        },
      ],
      rtl: isRTL,
    }),
    [imagesForScrollView.length]
  );

  useEffect(() => {
    setIsClient(true);
    if (collection?.value) {
      const payload = {
        slug: collection?.value,
        first: 20,
        pageNo: 1,
      };
      fpi.executeGQL(FEATURED_COLLECTION, payload).then((res) => {
        setIsLoading(false);
        return fpi.custom.setValue(
          `featuredCollectionData-${collection?.value}`,
          res
        );
      });
    }
  }, [collection, locationDetails?.pincode, i18nDetails?.currency?.code]);

  function getImgSrcSet() {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1728 }, width: 1691 },
      { breakpoint: { min: 1512 }, width: 1487 },
      { breakpoint: { min: 1296 }, width: 1282 },
      { breakpoint: { min: 1080 }, width: 1069 },
      { breakpoint: { min: 900 }, width: 897 },
      { breakpoint: { min: 720 }, width: 1530 },
      { breakpoint: { min: 540 }, width: 1170 },
      { breakpoint: { min: 360 }, width: 810 },
      { breakpoint: { min: 180 }, width: 450 },
    ];
  }

  function getWidthByCount() {
    if (windowWidth <= 768) {
      return getGallery?.length <= 3 ? getGallery?.length : 3;
    }
    return getGallery?.length < item_count?.value
      ? getGallery?.length
      : item_count?.value;
  }

  function imagesForStackedView() {
    const itemCount = item_count?.value;

    if (!getGallery) return [];

    if (windowWidth <= 480) {
      return getGallery.slice(0, 4);
    }
    if (windowWidth <= 768) {
      return getGallery.slice(0, 6);
    }
    return getGallery.slice(0, itemCount * 2);
  }

  function showStackedView() {
    if (windowWidth <= 768) {
      return (
        mobile_layout?.value === "grid" ||
        mobile_layout?.value === "banner_stacked"
      );
    }
    return desktop_layout?.value === "grid";
  }

  function showScrollView() {
    if (windowWidth <= 768) {
      return mobile_layout?.value === "horizontal";
    }
    return desktop_layout?.value === "horizontal";
  }

  function showBannerScrollView() {
    if (windowWidth <= 768) {
      return mobile_layout?.value === "banner_horizontal_scroll";
    }
    return desktop_layout?.value === "banner_horizontal_scroll";
  }

  const handleWishlistToggle = (data) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    toggleWishlist(data);
  };

  const imgSrcSet = useMemo(() => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 481 }, width: img_resize?.value ?? 300 },
      { breakpoint: { max: 480 }, width: img_resize_mobile?.value ?? 500 },
    ];
  }, [globalConfig?.img_hd, img_resize?.value, img_resize_mobile?.value]);

  const titleSizeDesktop = "32px";
  const titleSizeTablet = "28px";

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
    "--bg-color": `${img_container_bg?.value || "#00000000"}`,
  };

  return (
    <>
      <section className={styles.sectionWrapper} style={dynamicStyles}>
        <div
          className={`fx-title-block ${styles.titleBlock} ${desktop_layout?.value === "banner_horizontal_scroll" ? styles.hideOnDesktop : ""}  ${mobile_layout?.value === "banner_horizontal_scroll" ? styles.hideOnDesktop : ""}`}
          style={{
            alignItems:
              text_alignment?.value === "left"
                ? "flex-start"
                : text_alignment?.value === "right"
                  ? "flex-end"
                  : "center",
          }}
        >
          {heading?.value?.length > 0 && (
            <h2
              className={`fx-title ${styles.sectionHeading} fontHeader`}
              style={{
                textAlign: text_alignment?.value,
                fontSize:
                  windowWidth > 768 ? titleSizeDesktop : titleSizeTablet,
              }}
            >
              {heading?.value}
            </h2>
          )}
          {description?.value?.length > 0 && (
            <p
              className={`fx-description ${styles.description} b2`}
              style={{ textAlign: text_alignment?.value }}
            >
              {description?.value}
            </p>
          )}
          {show_view_all?.value &&
            button_position?.value !== "below_products" && (
              <div
                className={`${styles["gap-above-button"]} ${styles.visibleOnDesktop}`}
              >
                <FDKLink to={`/collection/${slug}`}>
                  <button
                    type="button"
                    className={`fx-button btn-secondary ${styles["section-button"]} ${styles.fontBody}`}
                  >
                    {button_text?.value
                      ? button_text?.value
                      : t("resource.facets.view_all")}
                  </button>
                </FDKLink>
              </div>
            )}
        </div>
        {getGallery?.length > 0 && (
          <div
            className={`${styles.bannerImageSliderWrap} ${
              desktop_layout?.value === "banner_horizontal_scroll"
                ? styles.desktopVisibleFlex
                : styles.desktopHiddenFlex
            } ${
              mobile_layout?.value === "banner_horizontal_scroll"
                ? styles.mobileVisible
                : styles.mobileHidden
            }`}
          >
            <FDKLink to={`/collection/${slug}`} className={styles.bannerImage}>
              <FyImage
                globalConfig={globalConfig}
                src={bannerUrl}
                sources={getImgSrcSet()}
                aspectRatio="0.8"
                mobileAspectRatio="0.8"
                alt={imgAlt}
              />
            </FDKLink>
            <div className={styles.slideWrapBanner}>
              <div
                className={`${styles.titleBlock} ${styles.bannerTitleBlock}`}
                style={{
                  alignItems:
                    text_alignment?.value === "left"
                      ? "flex-start"
                      : text_alignment?.value === "right"
                        ? "flex-end"
                        : "center",
                }}
              >
                {heading?.value?.length > 0 && (
                  <h2
                    className={`fx-title ${styles.sectionHeading} fontHeader`}
                    style={{
                      textAlign: text_alignment?.value,
                      fontSize:
                        windowWidth > 768 ? titleSizeDesktop : titleSizeTablet,
                    }}
                  >
                    {heading?.value}
                  </h2>
                )}
                {description?.value?.length > 0 && (
                  <p
                    className={`fx-description ${styles.description} b2`}
                    style={{ textAlign: text_alignment?.value }}
                  >
                    {description?.value}
                  </p>
                )}
                {show_view_all?.value &&
                  button_position?.value !== "below_products" && (
                    <div
                      className={`${styles["gap-above-button"]} ${styles.visibleOnDesktop}`}
                    >
                      <FDKLink to={`/collection/${slug}`}>
                        <button
                          type="button"
                          className={`fx-button btn-secondary ${styles["section-button"]} ${styles.fontBody}`}
                        >
                          {button_text?.value
                            ? button_text?.value
                            : t("resource.facets.view_all")}
                        </button>
                      </FDKLink>
                    </div>
                  )}
              </div>
              <div
                className={`${styles.productSlider} ${styles.bannerSlider} ${imagesForScrollView?.length <= 1 ? styles.lessItem : ""}`}
              >
                <Carousel opts={config}>
                  <CarouselContent>
                    {imagesForScrollView?.map((product, index) => (
                      <CarouselItem
                        key={index}
                        style={{ flex: `0 0 ${slideBasis}` }}
                      >
                        <ProductCardItem
                          key={`${product.uid}_${index}`}
                          className={styles.sliderItem}
                          product={product}
                          imgSrcSet={imgSrcSet}
                          listingPrice={listingPrice}
                          props={props}
                          globalConfig={globalConfig}
                          showAddToCart={showAddToCart}
                          actionButtonText={card_cta_text?.value}
                          followedIdList={followedIdList}
                          isSlider={true}
                          handleWishlistToggle={handleWishlistToggle}
                          handleAddToCart={handleAddToCart}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className={styles.carouselBtn} />
                  <CarouselNext className={styles.carouselBtn} />
                </Carousel>
              </div>
              {show_view_all?.value && (
                <div
                  className={`${styles["flex-justify-center"]} ${styles["gap-above-button"]} ${button_position?.value === "below_products" ? "" : styles.visibleOnMobile}`}
                >
                  <FDKLink to={`/collection/${slug}`}>
                    <button
                      type="button"
                      className={`fx-button btn-secondary ${styles["section-button"]} ${styles.fontBody}`}
                    >
                      {button_text?.value
                        ? button_text?.value
                        : t("resource.facets.view_all")}
                    </button>
                  </FDKLink>
                </div>
              )}
            </div>
          </div>
        )}
        {getGallery.length > 0 && (
          <div
            className={`${styles.productSlider} ${imagesForScrollView?.length <= itemCountMobile ? styles.lessItem : ""} ${
              desktop_layout?.value === "horizontal"
                ? styles.desktopVisible
                : styles.desktopHidden
            } ${
              mobile_layout?.value === "horizontal"
                ? styles.mobileVisible
                : styles.mobileHidden
            }`}
          >
            <Carousel opts={config}>
              <CarouselContent>
                {imagesForScrollView?.map((product, index) => (
                  <CarouselItem
                    key={index}
                    style={{ flex: `0 0 ${slideBasis}` }}
                  >
                    <ProductCardItem
                      key={`${product.uid}_${index}`}
                      className={styles.sliderItem}
                      product={product}
                      imgSrcSet={imgSrcSet}
                      listingPrice={listingPrice}
                      props={props}
                      globalConfig={globalConfig}
                      showAddToCart={showAddToCart}
                      actionButtonText={card_cta_text?.value}
                      followedIdList={followedIdList}
                      isSlider={true}
                      handleWishlistToggle={handleWishlistToggle}
                      handleAddToCart={handleAddToCart}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className={styles.carouselBtn} />
              <CarouselNext className={styles.carouselBtn} />
            </Carousel>
          </div>
        )}
        {getGallery.length > 0 && (
          <div
            className={`${
              desktop_layout?.value === "grid"
                ? styles.desktopVisible
                : styles.desktopHidden
            } ${
              mobile_layout?.value === "grid" ||
              mobile_layout?.value === "banner_stacked"
                ? styles.mobileVisible
                : styles.mobileHidden
            }`}
          >
            {mobile_layout?.value === "banner_stacked" && (
              <FDKLink
                to={`/collection/${slug}`}
                className={`${styles.bannerImage} ${styles.hideOnDesktop}`}
                style={{ marginBottom: "24px" }}
              >
                <FyImage
                  globalConfig={globalConfig}
                  src={bannerUrl}
                  sources={getImgSrcSet()}
                  aspectRatio="0.8"
                  mobileAspectRatio="0.8"
                  alt={imgAlt}
                />
              </FDKLink>
            )}
            <div
              className={`${styles.imageGrid} ${
                imagesForStackedView().length === 1 && styles.singleItem
              }`}
              style={{
                "--per-row": item_count?.value,
                "--per-row-mobile": itemCountMobile,
                "--brand-item": getWidthByCount() || 1,
              }}
            >
              {imagesForStackedView().map((product, index) => (
                <ProductCardItem
                  key={`${product.uid}_${index}`}
                  product={product}
                  imgSrcSet={imgSrcSet}
                  listingPrice={listingPrice}
                  props={props}
                  globalConfig={globalConfig}
                  showAddToCart={showAddToCart}
                  actionButtonText={card_cta_text?.value}
                  followedIdList={followedIdList}
                  handleWishlistToggle={handleWishlistToggle}
                  handleAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}
        {!getGallery.length && !isLoading && (
          <div
            className={`${styles.bannerImageSliderWrap} ${styles.slideWrap}  ${
              desktop_layout?.value === "banner_horizontal_scroll"
                ? styles.desktopVisibleFlex
                : styles.desktopHiddenFlex
            } ${
              mobile_layout?.value === "banner_horizontal_scroll"
                ? styles.mobileVisible
                : styles.mobileHidden
            } `}
          >
            <div className={styles.bannerImage}>
              <FyImage
                globalConfig={globalConfig}
                src={bannerUrl || placeholderBanner}
                sources={getImgSrcSet()}
                aspectRatio="0.8"
                mobileAspectRatio="0.8"
              />
            </div>
            <div className={styles.slideWrapBanner}>
              <div
                className={styles.titleBlock}
                style={{ paddingInlineStart: "10px" }}
              >
                {heading?.value?.length > 0 && (
                  <h2
                    className={`${styles.sectionHeading} fontHeader`}
                    style={{ textAlign: "start" }}
                  >
                    {heading?.value}
                  </h2>
                )}
                {description?.value?.length > 0 && (
                  <p
                    className={`${styles.description} b2`}
                    style={{ textAlign: "start" }}
                  >
                    {description?.value}
                  </p>
                )}
              </div>
              <div style={{ display: "flex" }}>
                {FEATURED_COLLECTION_PLACEHOLDER_PRODUCTS.map(
                  (product, index) => (
                    <ProductCardItem
                      key={`${product.uid}_${index}`}
                      product={product}
                      imgSrcSet={imgSrcSet}
                      listingPrice={listingPrice}
                      props={props}
                      globalConfig={globalConfig}
                      showAddToCart={showAddToCart}
                      actionButtonText={card_cta_text?.value}
                      followedIdList={[]}
                      handleWishlistToggle={() => {}}
                      handleAddToCart={() => {}}
                    />
                  )
                )}
              </div>
              {show_view_all?.value && (
                <div
                  className={`${styles["flex-justify-center"]} ${styles["gap-above-button"]}`}
                >
                  <FDKLink to={`/collection/${slug}`}>
                    <button
                      type="button"
                      className={`fx-button btn-secondary ${styles["section-button"]} ${styles.fontBody}`}
                    >
                      {button_text?.value
                        ? button_text?.value
                        : t("resource.facets.view_all")}
                    </button>
                  </FDKLink>
                </div>
              )}
            </div>
          </div>
        )}
        {!getGallery.length && !isLoading && (
          <div
            className={`${
              desktop_layout?.value === "grid" ||
              desktop_layout?.value === "horizontal"
                ? styles.desktopVisible
                : styles.desktopHidden
            } ${
              mobile_layout?.value === "grid" ||
              mobile_layout?.value === "banner_stacked" ||
              mobile_layout?.value === "horizontal"
                ? styles.mobileVisible
                : styles.mobileHidden
            }`}
          >
            {mobile_layout?.value === "banner_stacked" && (
              <FyImage
                globalConfig={globalConfig}
                src={bannerUrl || placeholderBanner}
                sources={getImgSrcSet()}
                aspectRatio="0.8"
                mobileAspectRatio="0.8"
                alt={imgAlt}
                customClass={styles.hideOnDesktop}
              />
            )}
            <div
              className={`${showScrollView() ? styles.placeholderContainer : ""}`}
            >
              <div
                className={`${showStackedView() ? styles.imageGrid : ""} ${showScrollView() ? styles.placeholderScroll : ""}`}
                style={{
                  "--per-row": item_count?.value,
                  "--per-row-mobile": itemCountMobile,
                  "--brand-item": 3,
                }}
              >
                {FEATURED_COLLECTION_PLACEHOLDER_PRODUCTS.map(
                  (product, index) => (
                    <ProductCardItem
                      key={`${product.uid}_${index}`}
                      className={styles.placeholderItem}
                      product={product}
                      imgSrcSet={imgSrcSet}
                      listingPrice={listingPrice}
                      props={props}
                      globalConfig={globalConfig}
                      showAddToCart={showAddToCart}
                      actionButtonText={card_cta_text?.value}
                      followedIdList={[]}
                      handleWishlistToggle={() => {}}
                      handleAddToCart={() => {}}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}
        {show_view_all?.value &&
          !showBannerScrollView() &&
          getGallery?.length > 0 && (
            <div
              className={`${styles["flex-justify-center"]} ${
                imagesForScrollView?.length <= 3 ? styles.lessGap : ""
              } ${showScrollView() && isClient ? styles["gap-above-button-horizontal"] : styles["gap-above-button"]} ${button_position?.value === "below_products" ? "" : styles.visibleOnMobile}`}
            >
              <FDKLink to={`/collection/${slug}`}>
                <button
                  type="button"
                  className={`fx-button btn-secondary ${styles["section-button"]}`}
                >
                  {button_text?.value
                    ? button_text?.value
                    : t("resource.facets.view_all")}
                </button>
              </FDKLink>
            </div>
          )}
      </section>
      {showAddToCart && (
        <>
          {isAddToCartOpen && (
            <Suspense fallback={<div />}>
              <Modal
                isOpen={isAddToCartOpen}
                hideHeader={!isTablet}
                bodyClassName={styles.addToCartBody}
                title={
                  isTablet
                    ? restAddToModalProps?.productData?.product?.name
                    : ""
                }
                closeDialog={restAddToModalProps?.handleClose}
                containerClassName={styles.addToCartContainer}
              >
                <AddToCart
                  {...restAddToModalProps}
                  globalConfig={globalConfig}
                />
              </Modal>
            </Suspense>
          )}
          {showSizeGuide && (
            <Suspense fallback={<div />}>
              <SizeGuide
                isOpen={showSizeGuide}
                onCloseDialog={handleCloseSizeGuide}
                productMeta={restAddToModalProps?.productData?.product?.sizes}
              />
            </Suspense>
          )}
        </>
      )}
    </>
  );
}

const ProductCardItem = ({
  className = "",
  product,
  imgSrcSet,
  listingPrice,
  isSlider = false,
  props,
  globalConfig,
  showAddToCart = false,
  actionButtonText,
  followedIdList,
  handleWishlistToggle,
  handleAddToCart,
}) => {
  const { t } = useGlobalTranslation("translation");
  const {
    show_badge,
    show_wishlist_icon,
    img_fill,
    item_count,
    item_count_mobile,
    product_text_alignment,
  } = props;

  const columnCount = {
    desktop: item_count?.value > 3 ? 4 : 2,
    tablet: item_count?.value > 2 ? 3 : 2,
    mobile: item_count_mobile?.value,
  };

  return (
    <div className={className}>
      <FDKLink
        action={{
          ...(product?.action || {}),
          page: {
            ...(product?.action?.page || {}),
            query: {
              ...(product?.action?.page?.query || {}),
              ...(product?.sizes && { size: product?.sizes[0] }),
            },
          },
        }}
        state={{
          product: {
            ...product,
            sizes: { sellable: product?.sellable, sizes: product?.sizes },
          },
        }}
      >
        <ProductCard
          product={product}
          listingPrice={listingPrice}
          isSaleBadgeDisplayed={false}
          showBadge={show_badge?.value}
          columnCount={columnCount}
          isWishlistDisplayed={false}
          onWishlistClick={handleWishlistToggle}
          followedIdList={followedIdList}
          isWishlistIcon={show_wishlist_icon?.value}
          isImageFill={img_fill?.value}
          isPrice={globalConfig?.show_price}
          aspectRatio={getProductImgAspectRatio(globalConfig)}
          imagePlaceholder={placeholderProduct}
          showAddToCart={showAddToCart}
          actionButtonText={
            actionButtonText
              ? actionButtonText
              : t("resource.common.add_to_cart")
          }
          handleAddToCart={handleAddToCart}
          imgSrcSet={imgSrcSet}
          isSlider={isSlider}
          centerAlign={product_text_alignment?.value === "center"}
        />
      </FDKLink>
    </div>
  );
};

export const settings = {
  label: "t:resource.sections.featured_collection.featured_collection",
  props: [
    {
      type: "collection",
      id: "collection",
      label: "t:resource.sections.featured_collection.collection",
      info: "t:resource.sections.featured_collection.select_collection_for_products",
    },
    {
      id: "desktop_layout",
      type: "select",
      options: [
        {
          value: "horizontal",
          text: "t:resource.common.horizontal_scroll",
        },
        {
          value: "grid",
          text: "t:resource.common.stack",
        },
        {
          value: "banner_horizontal_scroll",
          text: "t:resource.sections.featured_collection.banner_horizontal_carousel",
        },
      ],
      default: "banner_horizontal_scroll",
      label: "t:resource.sections.featured_collection.layout_desktop",
      info: "t:resource.sections.featured_collection.desktop_content_alignment",
    },
    {
      id: "mobile_layout",
      type: "select",
      options: [
        {
          value: "horizontal",
          text: "t:resource.common.horizontal_scroll",
        },
        {
          value: "grid",
          text: "t:resource.common.stack",
        },
        {
          value: "banner_horizontal_scroll",
          text: "t:resource.sections.featured_collection.banner_horizontal_scroll",
        },
        {
          value: "banner_stacked",
          text: "t:resource.sections.featured_collection.banner_with_stack",
        },
      ],
      default: "horizontal",
      label: "t:resource.sections.featured_collection.layout_mobile",
      info: "t:resource.sections.featured_collection.content_alignment_mobile",
    },
    {
      id: "img_resize",
      label:
        "t:resource.sections.products_listing.image_size_for_tablet_desktop",
      type: "select",
      options: [
        {
          value: "300",
          text: "300px",
        },
        {
          value: "500",
          text: "500px",
        },
        {
          value: "700",
          text: "700px",
        },
        {
          value: "900",
          text: "900px",
        },
        {
          value: "1100",
          text: "1100px",
        },
        {
          value: "1300",
          text: "1300px",
        },
      ],
      default: "300",
    },
    {
      id: "img_resize_mobile",
      label: "t:resource.sections.products_listing.image_size_for_mobile",
      type: "select",
      options: [
        {
          value: "300",
          text: "300px",
        },
        {
          value: "500",
          text: "500px",
        },
        {
          value: "700",
          text: "700px",
        },
        {
          value: "900",
          text: "900px",
        },
      ],
      default: "500",
    },
    {
      type: "color",
      id: "img_container_bg",
      category: "t:resource.common.image_container",
      default: "#00000000",
      label: "t:resource.common.container_background_color",
      info: "t:resource.common.image_container_bg_color",
    },
    {
      type: "checkbox",
      id: "img_fill",
      category: "t:resource.common.image_container",
      default: true,
      label: "t:resource.common.fit_image_to_container",
      info: "t:resource.common.clip_image_to_fit_container",
    },
    {
      type: "text",
      id: "heading",
      default: "t:resource.default_values.featured_collection_heading",
      label: "t:resource.common.heading",
      info: "t:resource.common.section_heading_text",
    },
    {
      type: "text",
      id: "description",
      default: "t:resource.default_values.featured_collection_description",
      label: "t:resource.common.description",
      info: "t:resource.common.section_description_text",
    },
    {
      id: "text_alignment",
      type: "select",
      options: [
        {
          value: "left",
          text: "t:resource.common.start",
        },
        {
          value: "right",
          text: "t:resource.common.end",
        },
        {
          value: "center",
          text: "t:resource.common.center",
        },
      ],
      default: "center",
      label: "t:resource.sections.featured_collection.text_alignment",
      info: "t:resource.sections.featured_collection.alignment_of_text_content",
    },
    {
      id: "product_text_alignment",
      type: "select",
      options: [
        {
          value: "left",
          text: "t:resource.common.left",
        },
        {
          value: "center",
          text: "t:resource.common.center",
        },
      ],
      default: "left",
      label: "t:resource.sections.featured_collection.product_text_alignment",
      info: "t:resource.sections.featured_collection.product_text_alignment_info",
    },
    // {
    //   id: "title_size",
    //   type: "select",
    //   options: [
    //     {
    //       value: "small",
    //       text: "t:resource.sections.featured_collection.small",
    //     },
    //     {
    //       value: "medium",
    //       text: "t:resource.sections.featured_collection.medium",
    //     },
    //     {
    //       value: "large",
    //       text: "t:resource.sections.featured_collection.large",
    //     },
    //   ],
    //   default: "medium",
    //   label: "t:resource.sections.featured_collection.title_size",
    //   info: "t:resource.sections.featured_collection.select_title_size",
    // },
    {
      type: "text",
      id: "button_text",
      default: "t:resource.default_values.view_all",
      label: "t:resource.common.button_text",
    },
    {
      id: "button_position",
      type: "select",
      options: [
        {
          value: "below_description",
          text: "Below description",
        },
        {
          value: "below_products",
          text: "Below products",
        },
      ],
      default: "below_description",
      label: "Button Position",
      info: "Applicable for only desktop view",
    },
    {
      type: "range",
      id: "item_count",
      min: 3,
      max: 6,
      step: 1,
      unit: "",
      label: "t:resource.sections.featured_collection.products_per_row_desktop",
      default: 4,
      info: "t:resource.sections.featured_collection.max_items_per_row_horizontal_scroll",
    },
    {
      type: "range",
      id: "item_count_mobile",
      min: 1,
      max: 2,
      step: 1,
      unit: "",
      label: "t:resource.sections.featured_collection.products_per_row_mobile",
      default: 1,
      info: "t:resource.sections.featured_collection.max_items_per_row_horizontal_scroll",
    },
    {
      type: "range",
      id: "max_count",
      min: 1,
      max: 25,
      step: 1,
      unit: "",
      label: "t:resource.sections.featured_collection.maximum_products_to_show",
      default: 10,
      info: "t:resource.sections.featured_collection.max_products_horizontal_scroll",
    },
    {
      type: "checkbox",
      id: "show_add_to_cart",
      label: "t:resource.common.show_add_to_cart",
      info: "t:resource.common.not_applicable_international_websites",
      default: true,
    },
    {
      type: "text",
      id: "card_cta_text",
      label: "t:resource.common.button_text",
      default:
        "t:resource.settings_schema.cart_and_button_configuration.add_to_cart",
    },
    {
      type: "checkbox",
      id: "show_wishlist_icon",
      label: "t:resource.common.show_wish_list_icon",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_badge",
      label: "t:resource.sections.featured_collection.show_badge",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_view_all",
      label: "t:resource.sections.featured_collection.show_view_all_button",
      default: true,
    },
    {
      type: "checkbox",
      id: "mandatory_pincode",
      label: "t:resource.common.mandatory_delivery_check",
      info: "t:resource.pages.wishlist.mandatory_delivery_check_info",
      default: false,
    },
    {
      type: "checkbox",
      id: "hide_single_size",
      label: "t:resource.common.hide_single_size_info",
      info: "t:resource.pages.wishlist.hide_single_size_info",
      default: false,
    },
    {
      type: "checkbox",
      id: "preselect_size",
      label: "t:resource.common.preselect_size",
      info: "t:resource.pages.wishlist.preselect_size_info",
      default: false,
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.top_padding",
      default: 16,
      info: "t:resource.sections.categories.top_padding_for_section",
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.bottom_padding",
      default: 16,
      info: "t:resource.sections.categories.bottom_padding_for_section",
    },
  ],
};

Component.serverFetch = async ({ fpi, props, id }) => {
  try {
    const payload = {
      slug: props.collection.value,
      first: 20,
      pageNo: 1,
    };
    await fpi.executeGQL(FEATURED_COLLECTION, payload).then((res) => {
      return fpi.custom.setValue(
        `featuredCollectionData-${props.collection.value}`,
        res
      );
    });
  } catch (err) {
    console.log(err);
  }
};
export default Component;
