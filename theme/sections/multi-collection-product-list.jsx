import React, { useState, useMemo, useEffect, useRef } from "react";
import Slider from "react-slick";
import { FDKLink } from "fdk-core/components";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import {
  useAccounts,
  useViewport,
  useWishlist,
  useThemeFeature,
} from "../helper/hooks";
import ArrowLeftIcon from "../assets/images/glide-arrow-left.svg";
import ArrowRightIcon from "../assets/images/glide-arrow-right.svg";
import { FEATURED_COLLECTION } from "../queries/collectionsQuery";
import styles from "../styles/sections/multi-collection-product-list.less";
import ProductCard from "@gofynd/theme-template/components/product-card/product-card";
import "@gofynd/theme-template/components/product-card/product-card.css";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import "@gofynd/theme-template/components/core/modal/modal.css";
import AddToCart from "@gofynd/theme-template/page-layouts/plp/Components/add-to-cart/add-to-cart";
import "@gofynd/theme-template/page-layouts/plp/Components/add-to-cart/add-to-cart.css";
import SizeGuide from "@gofynd/theme-template/page-layouts/plp/Components/size-guide/size-guide";
import "@gofynd/theme-template/page-layouts/plp/Components/size-guide/size-guide.css";
import { isRunningOnClient } from "../helper/utils";
import useAddToCartModal from "../page-layouts/plp/useAddToCartModal";

export function Component({ props = {}, blocks = [], globalConfig = {} }) {
  const fpi = useFPI();
  const { isInternational } = useThemeFeature({ fpi });
  const {
    heading,
    position,
    viewAll,
    per_row,
    img_fill,
    show_wishlist_icon,
    show_add_to_cart,
    mandatory_pincode,
    hide_single_size,
    preselect_size,
    img_resize,
    img_resize_mobile,
  } = props;
  const showAddToCart =
    !isInternational && show_add_to_cart?.value && !globalConfig?.disable_cart;
  const customValues = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) ?? {};
  const [activeLink, setActiveLink] = useState(0);
  const [activeCollectionItems, setActiveCollectionItems] = useState(
    customValues[`mcpl-${blocks?.[0]?.props?.collection?.value}`]
  );
  const { isLoggedIn, openLogin } = useAccounts({ fpi });
  const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const listingPrice =
    CONFIGURATION?.app_features?.common?.listing_price?.value || "range";
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const pincodeDetails = useGlobalStore(fpi?.getters?.PINCODE_DETAILS);
  const isTablet = useViewport(0, 768);

  const addToCartConfigs = {
    mandatory_pincode,
    hide_single_size,
    preselect_size,
  };

  const addToCartModalProps = useAddToCartModal({
    fpi,
    pageConfig: addToCartConfigs,
  });

  const columnCount = {
    desktop: per_row?.value > 3 ? 4 : 2,
    tablet: per_row?.value > 2 ? 3 : 2,
    mobile: activeCollectionItems?.length >= 2 ? 2 : 1,
  };

  const {
    handleAddToCart,
    isOpen: isAddToCartOpen,
    showSizeGuide,
    handleCloseSizeGuide,
    ...restAddToModalProps
  } = addToCartModalProps;

  const pincode = useMemo(() => {
    if (!isRunningOnClient()) {
      return "";
    }
    return pincodeDetails?.localityValue || locationDetails?.pincode || "";
  }, [pincodeDetails, locationDetails]);

  const lastPincodeRef = useRef(pincode);

  const handleWishlistToggle = (data) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    toggleWishlist(data);
  };

  const config = useMemo(() => {
    const colCount = Number(per_row?.value ?? 4);
    const isCollectionExceedCount = activeCollectionItems?.length > colCount;
    return {
      dots: isCollectionExceedCount,
      arrows: isCollectionExceedCount,
      infinite: isCollectionExceedCount,
      speed: 400,
      swipeToSlide: true,
      touchMove: true,
      touchThreshold: 8,
      slidesToShow: colCount,
      slidesToScroll: colCount,
      autoplay: false,
      autoplaySpeed: 3000,
      centerMode: false,
      cssEase: "ease-in-out",
      nextArrow: <ArrowRightIcon />,
      prevArrow: <ArrowLeftIcon />,
      responsive: [
        {
          breakpoint: 780,
          settings: {
            arrows: false,
          },
        },
      ],
    };
  }, [activeCollectionItems?.length, per_row?.value]);

  const configMobile = useMemo(() => {
    const colCount = Number(per_row?.value ?? 4);
    const isCollectionExceedCount = activeCollectionItems?.length > colCount;
    return {
      infinite: isCollectionExceedCount,
      speed: 400,
      swipeToSlide: true,
      touchMove: true,
      touchThreshold: 8, // Increase for smoother swiping
      autoplay: false,
      autoplaySpeed: 3000,
      cssEase: "ease-in-out",
      nextArrow: <ArrowRightIcon />,
      prevArrow: <ArrowLeftIcon />,
      dots: false,
      arrows: false,
      slidesToShow: activeCollectionItems?.length >= 2 ? 2 : 1,
      slidesToScroll: 1,
      draggable: true, // Allow dragging for swipe gestures
      focusOnSelect: false, // Avoid snapping to selected slide on tap
      centerMode: false, // Prevent sticky slides on swipe
      adaptiveHeight: true, // Prevent layout jump between slides
      initialSlide: 0, // Start from the first slide
      waitForAnimate: false, // Avoid delays between slides during swipe
      edgeFriction: 0.35, // Provide some resistance at the edges
      // centerMode: activeCollectionItems?.length !== 1,
      // centerPadding: "25px",
    };
  }, [activeCollectionItems?.length, per_row?.value]);

  const dynamicStyles = {
    paddingBottom: `16px`,
  };
  const handleLinkChange = (index) => {
    setActiveLink(index);
  };
  const navigationsAndCollections = useMemo(
    () =>
      (blocks ?? []).reduce((result, block) => {
        if (
          block?.props?.navigation?.value ||
          block?.props?.icon_image?.value
        ) {
          result.push({
            collection: block?.props?.collection?.value,
            text: block?.props?.navigation?.value,
            link: block?.props?.collection?.value
              ? `/collection/${block?.props?.collection?.value}`
              : block?.props?.redirect_link?.value,
            icon: block?.props?.icon_image?.value,
          });
        }
        return result;
      }, []),
    [blocks]
  );
  const fetchCollection = (slug) => {
    const payload = {
      slug,
      first: 12,
      pageNo: 1,
    };

    fpi.executeGQL(FEATURED_COLLECTION, payload).then((res) => {
      fpi.custom.setValue(
        `mcpl-${slug}`,
        res?.data?.collection?.products?.items ?? []
      );
      setActiveCollectionItems(res?.data?.collection?.products?.items);
    });
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

  useEffect(() => {
    const activeCollection =
      navigationsAndCollections?.[activeLink]?.collection || "";

    if (activeCollection) {
      if (
        customValues[`mcpl-${activeCollection}`] &&
        lastPincodeRef.current === pincode
      ) {
        setActiveCollectionItems(customValues[`mcpl-${activeCollection}`]);
      } else {
        lastPincodeRef.current = pincode;
        fetchCollection(activeCollection);
      }
    }
  }, [activeLink, navigationsAndCollections, pincode]);

  return (
    <>
      <div style={dynamicStyles} className={`${styles.sectionWrapper} `}>
        {heading?.value && (
          <div
            className={`${styles.titleBlock} ${
              position?.value === "center" ? styles.moveCenter : ""
            } ${viewAll?.value ? styles.isViewAllCta : ""}`}
          >
            <h2 className="fontHeader">{heading.value}</h2>
            {viewAll?.value && (
              <div className={`${styles.viewAllCta} ${styles.alignViewAll}`}>
                <FDKLink
                  to={navigationsAndCollections?.[activeLink]?.link ?? ""}
                >
                  <span>View All</span>
                </FDKLink>
              </div>
            )}
          </div>
        )}

        <div className={styles.navigationBlockWrapper}>
          <div
            className={`${styles.navigationBlock} ${
              position?.value === "center" ? styles.moveCenter : ""
            }`}
          >
            {navigationsAndCollections.map((item, index) => (
              <NavigationButton
                key={index + item.text}
                navigation={item}
                isActive={activeLink === index}
                onClick={() => handleLinkChange(index)}
              />
            ))}
          </div>
        </div>
        <div className={styles.productContainer}>
          {activeCollectionItems?.length > 0 && (
            <div
              className={styles.slideWrap}
              style={{
                "--slick-dots": `${Math.ceil(activeCollectionItems?.length / per_row?.value) * 22 + 10}px`,
              }}
            >
              <Slider
                className={`
                ${
                  activeCollectionItems?.length <= per_row?.value
                    ? "no-nav"
                    : ""
                } ${styles.customSlider} ${styles.hideOnMobile}`}
                {...config}
              >
                {activeCollectionItems?.map((product, index) => (
                  <div
                    data-cardtype="'Products'"
                    key={index}
                    className={styles.sliderView}
                  >
                    <FDKLink to={`/product/${product.slug}`}>
                      <ProductCard
                        product={product}
                        listingPrice={listingPrice}
                        isSaleBadgeDisplayed={false}
                        isWishlistDisplayed={false}
                        isWishlistIcon={show_wishlist_icon?.value}
                        columnCount={columnCount}
                        isPrice={globalConfig?.show_price}
                        isImageFill={img_fill?.value}
                        onWishlistClick={handleWishlistToggle}
                        followedIdList={followedIdList}
                        showAddToCart={showAddToCart}
                        handleAddToCart={handleAddToCart}
                        aspectRatio={getProductImgAspectRatio(globalConfig)}
                        imgSrcSet={imgSrcSet}
                        isSlider
                      />
                    </FDKLink>
                  </div>
                ))}
              </Slider>
              <Slider
                className={`
                ${
                  activeCollectionItems?.length <= per_row?.value
                    ? "no-nav"
                    : ""
                } ${styles.customSlider} ${styles.hideOnDesktop}`}
                {...configMobile}
              >
                {activeCollectionItems?.map((product, index) => (
                  <div
                    data-cardtype="'Products'"
                    key={index}
                    className={styles.sliderView}
                  >
                    <FDKLink to={`/product/${product.slug}`}>
                      <ProductCard
                        product={product}
                        listingPrice={listingPrice}
                        isSaleBadgeDisplayed={false}
                        isWishlistDisplayed={false}
                        isWishlistIcon={show_wishlist_icon?.value}
                        columnCount={columnCount}
                        isPrice={globalConfig?.show_price}
                        isImageFill={img_fill?.value}
                        onWishlistClick={handleWishlistToggle}
                        followedIdList={followedIdList}
                        showAddToCart={showAddToCart}
                        handleAddToCart={handleAddToCart}
                        aspectRatio={getProductImgAspectRatio(globalConfig)}
                        imgSrcSet={imgSrcSet}
                        isSlider
                      />
                    </FDKLink>
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
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
    </>
  );
}

const NavigationButton = ({ navigation, isActive, onClick = () => {} }) => {
  const { collection = "", icon = "", text, link = "" } = navigation || {};
  if (collection) {
    return (
      <button
        className={`${styles.navigation} ${isActive ? styles.activeLink : ""}`}
        onClick={onClick}
      >
        <NavigationButtonContent icon={icon} text={text} />
      </button>
    );
  }
  return (
    <FDKLink
      className={`${styles.navigation} ${isActive ? styles.activeLink : ""}`}
      to={link}
    >
      <NavigationButtonContent icon={icon} text={text} />
    </FDKLink>
  );
};

const NavigationButtonContent = ({ icon, text }) => {
  return (
    <>
      {icon && (
        <FyImage
          customClass={styles.iconImage}
          src={icon}
          sources={[{ width: 40 }]}
          defer={false}
          alt={`${text} icon`}
          showSkeleton={false}
          isFixedAspectRatio={false}
          isLazyLoaded={false}
          backgroundColor="transparent"
        />
      )}
      {text}
    </>
  );
};

export const settings = {
  label: "Multi Collection Product List",
  props: [
    {
      type: "text",
      id: "heading",
      default: "",
      label: "Heading",
    },
    {
      type: "range",
      id: "per_row",
      min: 2,
      max: 6,
      step: 1,
      unit: "",
      label: "Products per row",
      default: 4,
      info: "Maximum products allowed per row",
    },
    {
      id: "position",
      type: "select",
      options: [
        {
          value: "left",
          text: "Left",
        },
        {
          value: "center",
          text: "Center",
        },
      ],
      default: "left",
      label: "Header Position",
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
      type: "checkbox",
      id: "viewAll",
      default: false,
      label: "Show View All",
      info: '"View All" will be visible only if a "Heading" is provided.',
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
      type: "checkbox",
      id: "show_wishlist_icon",
      label: "Show Wish List Icon",
      default: true,
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
  blocks: [
    {
      type: "collection-item",
      name: "Navigation",
      props: [
        {
          type: "header",
          value: "Icon or Navigation Name is mandatory",
        },
        {
          type: "image_picker",
          id: "icon_image",
          label: "Icon",
          default: "",
        },
        {
          type: "text",
          id: "navigation",
          label: "Navigation Name",
          default: "",
        },
        {
          type: "collection",
          id: "collection",
          label: "Collection",
          info: "Select a collection to display its products",
        },
        {
          type: "url",
          id: "redirect_link",
          label: "Button Link",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "Navigation",
      },
    ],
  },
};

Component.serverFetch = async ({ fpi, props, blocks }) => {
  const slug = blocks?.[0]?.props?.collection?.value;
  const navigation = blocks?.[0]?.props?.navigation?.value;
  if (slug && navigation) {
    const payload = {
      slug,
      first: 12,
      pageNo: 1,
    };

    return fpi.executeGQL(FEATURED_COLLECTION, payload).then((res) => {
      const items = res?.data?.collection?.products?.items ?? [];
      return fpi.custom.setValue(`mcpl-${slug}`, items);
    });
  }
};
export default Component;
