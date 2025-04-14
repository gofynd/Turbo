import React, { useEffect, useMemo, useRef, useState } from "react";
import { FDKLink } from "fdk-core/components";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import Slider from "react-slick";
import ProductCard from "@gofynd/theme-template/components/product-card/product-card";
import styles from "../styles/sections/featured-collection.less";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";
import ArrowRightIcon from "../assets/images/arrow-right.svg";
import { isRunningOnClient, throttle } from "../helper/utils";
import { FEATURED_COLLECTION } from "../queries/collectionsQuery";
import "@gofynd/theme-template/components/product-card/product-card.css";
import placeholderBanner from "../assets/images/placeholder/featured-collection-banner.png";
import placeholderProduct from "../assets/images/placeholder/featured-collection-product.png";
import useAddToCartModal from "../page-layouts/plp/useAddToCartModal";
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import AddToCart from "@gofynd/theme-template/page-layouts/plp/Components/add-to-cart/add-to-cart";
import "@gofynd/theme-template/page-layouts/plp/Components/add-to-cart/add-to-cart.css";
import SizeGuide from "@gofynd/theme-template/page-layouts/plp/Components/size-guide/size-guide";
import "@gofynd/theme-template/page-layouts/plp/Components/size-guide/size-guide.css";
import {
  useViewport,
  useAccounts,
  useWishlist,
  useThemeFeature,
} from "../helper/hooks";
import { getProductImgAspectRatio } from "../helper/utils";

export function Component({ props, globalConfig }) {
  const fpi = useFPI();
  const bannerRef = useRef(null);
  const isTablet = useViewport(0, 768);
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const listingPrice =
    CONFIGURATION?.app_features?.common?.listing_price?.value || "range";

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
  const {
    handleAddToCart,
    isOpen: isAddToCartOpen,
    showSizeGuide,
    handleCloseSizeGuide,
    ...restAddToModalProps
  } = addToCartModalProps;
  const {
    autoplay,
    play_slides,
    heading,
    description,
    item_count,
    mobile_layout,
    desktop_layout,
    img_fill,
    img_container_bg,
    button_text,
    collection,
    show_add_to_cart,
    show_wishlist_icon,
    item_count_mobile,
    show_view_all,
    show_badge,
    max_count,
    text_alignment,
    // title_size,
    img_resize,
    img_resize_mobile,
  } = props;
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
  const [windowWidth, setWindowWidth] = useState(0);
  // const [getGallery, setGetGallery] = useState([]);
  // const [slug, setSlug] = useState("");
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const i18nDetails = useGlobalStore(fpi.getters.i18N_DETAILS);
  const [isClient, setIsClient] = useState(false);
  const [config, setConfig] = useState({
    dots: imagesForScrollView()?.length > item_count?.value,
    speed: 300,
    slidesToShow: item_count?.value,
    slidesToScroll: item_count?.value,
    swipeToSlide: true,
    autoplay: false,
    infinite: false,
    autoplaySpeed: 3000,
    cssEase: "linear",
    arrows: imagesForScrollView()?.length > item_count?.value,
    adaptiveHeight: false,
    nextArrow: <SliderRightIcon />,
    prevArrow: <SliderLeftIcon />,
    responsive: [
      {
        breakpoint: 780,
        settings: {
          arrows: false,
          slidesToShow: 3,
          slidesToScroll: 3,
          dots: true,
          swipe: true,
          swipeToSlide: false,
          touchThreshold: 80,
          draggable: false,
          touchMove: true,
        },
      },
    ],
  });
  const [configMobile, setConfigMobile] = useState({
    dots: false,
    arrows: false,
    speed: 300,
    slidesToShow: item_count_mobile?.value ? item_count_mobile?.value : 1,
    slidesToScroll: 1,
    swipeToSlide: false,
    swipe: true,
    autoplay: false,
    infinite: false,
    autoplaySpeed: 3000,
    cssEase: "linear",
    adaptiveHeight: false,
    nextArrow: <SliderRightIcon />,
    prevArrow: <SliderLeftIcon />,
    // centerMode: true,
    centerPadding: "30px",
    touchThreshold: 80,
    draggable: false,
    touchMove: true,
  });

  const columnCount = {
    desktop: item_count?.value > 3 ? 4 : 2,
    tablet: item_count?.value > 2 ? 3 : 2,
    mobile: item_count_mobile?.value,
  };

  useEffect(() => {
    setWindowWidth(isRunningOnClient() ? window.innerWidth : 0);
    setIsClient(true);
    if (collection?.value) {
      const payload = {
        slug: collection?.value,
        first: 12,
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

  const bannerConfig = {
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
          dots: true,
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
          centerMode: getGallery?.length !== 1,
          centerPadding: "16px",
        },
      },
    ],
  };

  useEffect(() => {
    if (autoplay?.value !== config.autoplay) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        autoplay: autoplay?.value,
      }));
    }

    if (item_count?.value !== config.slidesToShow) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        slidesToShow: item_count?.value,
        slidesToScroll: item_count?.value,
      }));
    }

    if (play_slides?.value * 1000 !== config.autoplaySpeed) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        autoplaySpeed: play_slides?.value * 1000,
      }));
    }
    if (config.arrows !== imagesForScrollView()?.length > item_count?.value) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        arrows: true,
        dots: true,
      }));
    }
  }, [autoplay, play_slides, item_count, imagesForScrollView()?.length]);

  useEffect(() => {
    const handleResize = throttle(() => {
      setWindowWidth(isRunningOnClient() ? window.innerWidth : 0);
    }, 500);

    if (isRunningOnClient()) {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (isRunningOnClient()) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  function getImgSrcSet() {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1024 }, width: 450 },
      { breakpoint: { min: 768 }, width: 250 },
      { breakpoint: { min: 481 }, width: 480 },
      { breakpoint: { max: 390 }, width: 390 },
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

  function imagesForScrollView() {
    if (!getGallery) return [];
    return getGallery.slice(0, max_count?.value);
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

  return (
    <div
      className={styles.sectionWrapper}
      style={{
        paddingTop: "16px",
        paddingBottom: `16px`,
        "--bg-color": `${img_container_bg?.value || "#00000000"}`,
      }}
    >
      <div>
        <div
          className={`${styles.titleBlock} ${desktop_layout?.value === "banner_horizontal_scroll" ? styles.hideOnDesktop : ""}  ${mobile_layout?.value === "banner_horizontal_scroll" ? styles.hideOnMobile : ""}`}
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
              className={`${styles.sectionHeading} fontHeader`}
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
              className={`${styles.description} b2`}
              style={{ textAlign: text_alignment?.value }}
            >
              {description?.value}
            </p>
          )}
        </div>

        {getGallery?.length > 0 && (
          <div
            className={`${styles.bannerImageSliderWrap} ${styles.slideWrap}  ${
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
                  paddingLeft: "10px",
                }}
              >
                {heading?.value?.length > 0 && (
                  <h2
                    className={`${styles.sectionHeading} fontHeader`}
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
                    className={`${styles.description} b2`}
                    style={{ textAlign: text_alignment?.value }}
                  >
                    {description?.value}
                  </p>
                )}
                {button_text?.value && show_view_all?.value && (
                  <div
                    className={` ${styles["gap-above-button"]} ${styles.visibleOnDesktop}`}
                  >
                    <FDKLink to={`/collection/${slug}`}>
                      <button
                        type="button"
                        className={`btn-secondary ${styles["section-button"]} ${styles.fontBody}`}
                      >
                        {button_text?.value}
                      </button>
                    </FDKLink>
                  </div>
                )}
              </div>
              <div className={styles.slWrap}>
                <Slider
                  className={imagesForScrollView()?.length <= 3 ? "no-nav" : ""}
                  {...bannerConfig}
                  ref={bannerRef}
                >
                  {imagesForScrollView()?.map((product, index) => (
                    <div key={index} className={styles.sliderView}>
                      <FDKLink to={`/product/${product.slug}`}>
                        <ProductCard
                          product={product}
                          listingPrice={listingPrice}
                          isSaleBadgeDisplayed={false}
                          showBadge={show_badge?.value}
                          columnCount={columnCount}
                          isWishlistDisplayed={show_wishlist_icon?.value}
                          isWishlistIcon={show_wishlist_icon?.value}
                          isImageFill={img_fill?.value}
                          isPrice={globalConfig?.show_price}
                          onWishlistClick={handleWishlistToggle}
                          followedIdList={followedIdList}
                          aspectRatio={getProductImgAspectRatio(globalConfig)}
                          centerAlign={
                            windowWidth <= 480
                              ? mobile_layout?.value !==
                                "banner_horizontal_scroll"
                              : desktop_layout?.value !==
                                "banner_horizontal_scroll"
                          }
                          imagePlaceholder={placeholderProduct}
                          showAddToCart={showAddToCart}
                          imgSrcSet={imgSrcSet}
                          handleAddToCart={handleAddToCart}
                          isSlider
                        />
                      </FDKLink>
                    </div>
                  ))}
                </Slider>
                {getGallery?.length > 1 && (
                  <>
                    <span
                      className={styles.customPrevBtn}
                      onClick={() => bannerRef.current.slickPrev()}
                    >
                      <ArrowRightIcon />
                    </span>
                    <span
                      className={styles.customNextBtn}
                      onClick={() => bannerRef.current.slickNext()}
                    >
                      <ArrowRightIcon />
                    </span>
                  </>
                )}
              </div>
              {button_text?.value && show_view_all?.value && (
                <div
                  className={`${styles["flex-justify-center"]} ${styles["gap-above-button"]} ${styles.visibleOnMobile}`}
                >
                  <FDKLink to={`/collection/${slug}`}>
                    <button
                      type="button"
                      className={`btn-secondary ${styles["section-button"]} ${styles.fontBody}`}
                    >
                      {button_text?.value}
                    </button>
                  </FDKLink>
                </div>
              )}
            </div>
          </div>
        )}
        {getGallery.length > 0 && (
          <div
            className={`${styles.slideWrap}  ${
              desktop_layout?.value === "horizontal"
                ? styles.desktopVisible
                : styles.desktopHidden
            } ${
              mobile_layout?.value === "horizontal"
                ? styles.mobileVisible
                : styles.mobileHidden
            }`}
            style={{
              "--slick-dots": `${Math.ceil(imagesForScrollView()?.length / item_count?.value) * 22 + 10}px`,
            }}
          >
            <Slider
              className={`${imagesForScrollView()?.length <= 3 ? "no-nav" : ""} ${styles.hideOnMobile}`}
              {...config}
            >
              {imagesForScrollView()?.map((product, index) => (
                <div key={index} className={styles.sliderView}>
                  <FDKLink to={`/product/${product.slug}`}>
                    <ProductCard
                      product={product}
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
                      centerAlign={
                        windowWidth <= 480
                          ? mobile_layout?.value !== "banner_horizontal_scroll"
                          : desktop_layout?.value !== "banner_horizontal_scroll"
                      }
                      imagePlaceholder={placeholderProduct}
                      showAddToCart={showAddToCart}
                      handleAddToCart={handleAddToCart}
                      imgSrcSet={imgSrcSet}
                      isSlider
                    />
                  </FDKLink>
                </div>
              ))}
            </Slider>
            <Slider
              className={`${imagesForScrollView()?.length <= 3 ? "no-nav" : ""} ${styles.hideOnDesktop}`}
              {...configMobile}
            >
              {imagesForScrollView()?.map((product, index) => (
                <div key={index} className={styles.sliderView}>
                  <FDKLink to={`/product/${product.slug}`}>
                    <ProductCard
                      product={product}
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
                      centerAlign={
                        windowWidth <= 480
                          ? mobile_layout?.value !== "banner_horizontal_scroll"
                          : desktop_layout?.value !== "banner_horizontal_scroll"
                      }
                      imagePlaceholder={placeholderProduct}
                      showAddToCart={showAddToCart}
                      handleAddToCart={handleAddToCart}
                      imgSrcSet={imgSrcSet}
                      isSlider
                    />
                  </FDKLink>
                </div>
              ))}
            </Slider>
          </div>
        )}
        {getGallery.length > 0 && (
          <div
            className={`${styles.slideWrap}  ${
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
                "--per_row": item_count?.value,
                "--brand-item": getWidthByCount() || 1,
              }}
            >
              {imagesForStackedView().map((product, index) => (
                <div key={index} className={styles["pos-relative"]}>
                  <FDKLink to={`/product/${product.slug}`}>
                    <ProductCard
                      product={product}
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
                      centerAlign={
                        windowWidth <= 480
                          ? mobile_layout?.value !== "banner_horizontal_scroll"
                          : desktop_layout?.value !== "banner_horizontal_scroll"
                      }
                      imagePlaceholder={placeholderProduct}
                      showAddToCart={showAddToCart}
                      handleAddToCart={handleAddToCart}
                      imgSrcSet={imgSrcSet}
                      isSlider
                    />
                  </FDKLink>
                </div>
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
                style={{ paddingLeft: "10px" }}
              >
                {heading?.value?.length > 0 && (
                  <h2
                    className={`${styles.sectionHeading} fontHeader`}
                    style={{ textAlign: "left" }}
                  >
                    {heading?.value}
                  </h2>
                )}
                {description?.value?.length > 0 && (
                  <p
                    className={`${styles.description} b2`}
                    style={{ textAlign: "left" }}
                  >
                    {description?.value}
                  </p>
                )}
              </div>
              <div style={{ display: "flex" }}>
                {[1, 2, 3].map((category, index) => (
                  <div
                    key={index}
                    data-cardtype="'Categories'"
                    className={styles["pos-relative"]}
                    style={{ flex: "1" }}
                  >
                    <div style={{ padding: "0 12px" }}>
                      <FyImage
                        customClass={`${styles.imageGallery} ${
                          img_fill?.value ? styles.streach : ""
                        }`}
                        src={placeholderProduct}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {button_text?.value && show_view_all?.value && (
                <div
                  className={`${styles["flex-justify-center"]} ${styles["gap-above-button"]}`}
                >
                  <FDKLink to={`/collection/${slug}`}>
                    <button
                      type="button"
                      className={`btn-secondary ${styles["section-button"]} ${styles.fontBody}`}
                    >
                      {button_text?.value}
                    </button>
                  </FDKLink>
                </div>
              )}
            </div>
          </div>
        )}
        {!getGallery.length && !isLoading && (
          <div
            className={`${styles.slideWrap}  ${
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
              className={`${showStackedView() ? styles.placeholderGrid : ""} ${showScrollView() ? styles.placeholderScroll : ""}`}
              style={{
                "--per_row": item_count?.value,
                "--per_row_mobile": item_count_mobile?.value,
              }}
            >
              {new Array(item_count?.value).fill(0).map((_, index) => (
                <div
                  key={index}
                  data-cardtype="'Categories'"
                  className={styles["pos-relative"]}
                >
                  <div style={{ padding: "0 12px" }}>
                    <FyImage
                      customClass={`${styles.imageGallery} ${
                        img_fill?.value ? styles.streach : ""
                      }`}
                      src={placeholderProduct}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {button_text?.value &&
          show_view_all?.value &&
          !showBannerScrollView() &&
          getGallery?.length > 0 && (
            <div
              className={`${styles["flex-justify-center"]} ${
                imagesForScrollView()?.length <= 3 ? styles.lessGap : ""
              } ${showScrollView() && isClient ? styles["gap-above-button-horizontal"] : styles["gap-above-button"]}`}
            >
              <FDKLink to={`/collection/${slug}`}>
                <button
                  type="button"
                  className={`btn-secondary ${styles["section-button"]} ${styles.fontBody}`}
                >
                  {button_text?.value}
                </button>
              </FDKLink>
            </div>
          )}
      </div>
      {showAddToCart && (
        <>
          <Modal
            isOpen={isAddToCartOpen}
            hideHeader={!isTablet}
            bodyClassName={styles.addToCartBody}
            title={
              isTablet ? restAddToModalProps?.productData?.product?.name : ""
            }
            closeDialog={restAddToModalProps?.handleClose}
            containerClassName={styles.addToCartContainer}
          >
            <AddToCart {...restAddToModalProps} globalConfig={globalConfig} />
          </Modal>
          <SizeGuide
            isOpen={showSizeGuide}
            onCloseDialog={handleCloseSizeGuide}
            productMeta={restAddToModalProps?.productData?.product?.sizes}
          />
        </>
      )}
    </div>
  );
}

export const settings = {
  label: "Featured Collection",
  props: [
    {
      type: "collection",
      id: "collection",
      label: "Collection",
      info: "Select a collection to display its products",
    },
    {
      id: "desktop_layout",
      type: "select",
      options: [
        {
          value: "horizontal",
          text: "Horizontal scroll",
        },
        {
          value: "grid",
          text: "Stack",
        },
        {
          value: "banner_horizontal_scroll",
          text: "Banner with horizontal carousel",
        },
      ],
      default: "banner_horizontal_scroll",
      label: "Layout (Desktop)",
      info: "Alignment of content in desktop",
    },
    {
      id: "mobile_layout",
      type: "select",
      options: [
        {
          value: "horizontal",
          text: "Horizontal scroll",
        },
        {
          value: "grid",
          text: "Stack",
        },
        {
          value: "banner_horizontal_scroll",
          text: "Banner with horizontal scroll",
        },
        {
          value: "banner_stacked",
          text: "Banner with Stack",
        },
      ],
      default: "horizontal",
      label: "Layout (Mobile)",
      info: "Alignment of content in mobile",
    },
    {
      id: "img_resize",
      label: "Image size for Tablet/Desktop",
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
      label: "Image size for Mobile",
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
      category: "Image Container",
      default: "#00000000",
      label: "Container Background Color",
      info: "This color will be used as the container background color of the Product/Collection/Category/Brand images wherever applicable",
    },
    {
      type: "checkbox",
      id: "img_fill",
      category: "Image Container",
      default: true,
      label: "Fit image to the container",
      info: "If the image aspect ratio is different from the container, the image will be clipped to fit the container. The aspect ratio of the image will be maintained",
    },
    {
      type: "text",
      id: "heading",
      default: "New Arrivals",
      label: "Heading",
      info: "Heading text of the section",
    },
    {
      type: "text",
      id: "description",
      default:
        "Showcase your top collections here! Whether it's new arrivals, trending items, or special promotions, use this space to draw attention to what's most important in your store.",
      label: "Description",
      info: "Description text of the section",
    },
    {
      id: "text_alignment",
      type: "select",
      options: [
        {
          value: "left",
          text: "Left",
        },
        {
          value: "right",
          text: "Right",
        },
        {
          value: "center",
          text: "Center",
        },
      ],
      default: "center",
      label: "Text Alignment",
      info: "Alignment of text content",
    },
    // {
    //   id: "title_size",
    //   type: "select",
    //   options: [
    //     {
    //       value: "small",
    //       text: "Small",
    //     },
    //     {
    //       value: "medium",
    //       text: "Medium",
    //     },
    //     {
    //       value: "large",
    //       text: "Large",
    //     },
    //   ],
    //   default: "medium",
    //   label: "Title size",
    //   info: "Select title size",
    // },
    {
      type: "text",
      id: "button_text",
      default: "View all",
      label: "Button text",
    },
    {
      type: "range",
      id: "item_count",
      min: 3,
      max: 6,
      step: 1,
      unit: "",
      label: "Products per row (Desktop)",
      default: 4,
      info: "Maximum items allowed per row in horizontal scroll",
    },
    {
      type: "range",
      id: "item_count_mobile",
      min: 1,
      max: 2,
      step: 1,
      unit: "",
      label: "Products per row (Mobile)",
      default: 1,
      info: "Maximum items allowed per row in horizontal scroll",
    },
    {
      type: "range",
      id: "max_count",
      min: 1,
      max: 25,
      step: 1,
      unit: "",
      label: "Maximum products to show",
      default: 10,
      info: "Maximu products to show in horizontal scroll",
    },
    {
      type: "checkbox",
      id: "show_add_to_cart",
      label: "Show Add to Cart",
      info: "Not Applicable for International Websites",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_wishlist_icon",
      label: "Show Wish List Icon",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_badge",
      label: "Show Badge",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_view_all",
      label: "Show View All Button",
      default: true,
    },
    {
      type: "checkbox",
      id: "mandatory_pincode",
      label: "Mandatory Delivery check",
      info: "Mandatory delivery check in Add to Cart popup. Not applicable for international websites",
      default: false,
    },
    {
      type: "checkbox",
      id: "hide_single_size",
      label: "Hide single size",
      info: "Hide single size in Add to Cart popup. Not applicable for international websites",
      default: false,
    },
    {
      type: "checkbox",
      id: "preselect_size",
      label: "Preselect size",
      info: "Preselect size in Add to Cart popup. Applicable only for multi-sized products. Not applicable for international websites",
      default: false,
    },
  ],
};

Component.serverFetch = async ({ fpi, props, id }) => {
  try {
    const payload = {
      slug: props.collection.value,
      first: 12,
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
