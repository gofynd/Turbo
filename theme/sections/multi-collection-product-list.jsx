import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  lazy,
  Suspense,
} from "react";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import {
  useAccounts,
  useViewport,
  useWishlist,
  useThemeFeature,
  useLocaleDirection,
} from "../helper/hooks";
import { FEATURED_COLLECTION } from "../queries/collectionsQuery";
import styles from "../styles/sections/multi-collection-product-list.less";
import ProductCard from "@gofynd/theme-template/components/product-card/product-card";
import "@gofynd/theme-template/components/product-card/product-card.css";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import "@gofynd/theme-template/components/core/modal/modal.css";
import "@gofynd/theme-template/page-layouts/plp/Components/add-to-cart/add-to-cart.css";
import "@gofynd/theme-template/page-layouts/plp/Components/size-guide/size-guide.css";
import { isRunningOnClient, getProductImgAspectRatio } from "../helper/utils";
import useAddToCartModal from "../page-layouts/plp/useAddToCartModal";
import { FDKLink, BlockRenderer } from "fdk-core/components";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../components/carousel";
const Modal = lazy(
  () => import("@gofynd/theme-template/components/core/modal/modal")
);
const SizeGuide = lazy(
  () =>
    import(
      "@gofynd/theme-template/page-layouts/plp/Components/size-guide/size-guide"
    )
);
const AddToCart = lazy(
  () =>
    import(
      "@gofynd/theme-template/page-layouts/plp/Components/add-to-cart/add-to-cart"
    )
);

export function Component({ props = {}, blocks = [], globalConfig = {} }) {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const fpi = useFPI();
  const { isInternational } = useThemeFeature({ fpi });
  const {
    heading,
    description,
    position,
    viewAll,
    per_row,
    img_fill,
    show_wishlist_icon,
    show_add_to_cart,
    card_cta_text,
    enable_sales_badge,
    mandatory_pincode,
    hide_single_size,
    preselect_size,
    img_resize,
    img_resize_mobile,
    padding_top,
    padding_bottom,
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
  const { direction } = useLocaleDirection();

  const addToCartConfigs = {
    mandatory_pincode: mandatory_pincode?.value,
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
    is_serviceable,
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

  const handleLinkChange = (index) => {
    setActiveLink(index);
  };

  const navigationsAndCollections = useMemo(
    () =>
      (blocks ?? []).reduce((result, block) => {
        if (block.type !== "collection-item") {
          result.push(block);
        } else if (
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
      first: 20,
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

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  const colCount = Number(per_row?.value ?? 4);
  const len = activeCollectionItems?.length;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 480px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);

    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const slidesToShow = isMobile
    ? Math.min(2, Math.max(len, 1))
    : Math.max(colCount, 1);

  const carouselProps = useMemo(() => {
    const mobileSlidesToShow = Math.min(2, Math.max(len, 1));
    const opts = {
      align: "start",
      direction,
      loop: len > mobileSlidesToShow,
      draggable: true,
      containScroll: "trimSnaps",
      slidesToScroll: mobileSlidesToShow,
      duration: 25,
      startIndex: 0,
      breakpoints: {
        "(min-width: 481px)": {
          align: "start",
          loop: len > colCount,
          slidesToScroll: colCount,
        },
      },
    };
    return { opts };
  }, [direction, len, colCount]);

  const slideBasis = `${100 / slidesToShow}%`;

  return (
    <>
      <section className={styles.sectionWrapper} style={dynamicStyles}>
        {heading?.value && (
          <div
            className={`${styles.titleBlock} ${
              position?.value === "center" ? styles.moveCenter : ""
            } ${viewAll?.value ? styles.isViewAllCta : ""}`}
          >
            <div>
              <h2 className="fx-title fontHeader">{heading.value}</h2>
              {description?.value?.length > 0 && (
                <p
                  className={`fx-description ${styles.description} b2`}
                  style={{ textAlign: position?.value }}
                >
                  {description?.value}
                </p>
              )}
            </div>
          </div>
        )}

        <div
          className={`${styles.navigationBlockWrapper} ${
            position?.value === "center" ? styles.moveCenter : ""
          }`}
        >
          <div className={`${styles.navigationBlock}`}>
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
          {!!navigationsAndCollections?.[activeLink]?.type &&
          navigationsAndCollections?.[activeLink]?.type !==
            "collection-item" ? (
            <BlockRenderer block={navigationsAndCollections?.[activeLink]} />
          ) : (
            <>
              {activeCollectionItems?.length > 0 && (
                <div className={`remove-horizontal-scroll ${styles.slideWrap}`}>
                  <Carousel {...carouselProps}>
                    <CarouselContent>
                      {activeCollectionItems?.map((product, index) => (
                        <CarouselItem
                          key={index}
                          style={{ flex: `0 0 ${slideBasis}` }}
                        >
                          <div
                            data-cardtype="'Products'"
                            key={index}
                            className={styles.sliderView}
                          >
                            <div
                              className={styles.productCardWrapper}
                              onClick={() => {
                                navigate?.(`/product/${product.slug}`, {
                                  state: {
                                    product,
                                  },
                                });
                              }}
                            >
                              <ProductCard
                                product={product}
                                listingPrice={listingPrice}
                                isSaleBadge={enable_sales_badge?.value}
                                isWishlistDisplayed={false}
                                isWishlistIcon={show_wishlist_icon?.value}
                                columnCount={columnCount}
                                isPrice={globalConfig?.show_price}
                                isImageFill={img_fill?.value}
                                onWishlistClick={handleWishlistToggle}
                                followedIdList={followedIdList}
                                showAddToCart={showAddToCart}
                                actionButtonText={
                                  card_cta_text?.value ??
                                  t("resource.common.add_to_cart")
                                }
                                handleAddToCart={handleAddToCart}
                                aspectRatio={getProductImgAspectRatio(
                                  globalConfig
                                )}
                                imgSrcSet={imgSrcSet}
                                isSlider
                                isServiceable={is_serviceable}
                              />
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className={styles.carouselBtn} />
                    <CarouselNext className={styles.carouselBtn} />
                  </Carousel>
                </div>
              )}
            </>
          )}
          <div className={styles.viewAllWrapper}>
            {viewAll?.value && (
              <div className={`${styles.viewAllCta} ${styles.alignViewAll}`}>
                <FDKLink
                  className={"fx-button"}
                  to={navigationsAndCollections?.[activeLink]?.link ?? ""}
                >
                  <span>{t("resource.facets.view_all")}</span>
                </FDKLink>
              </div>
            )}
          </div>
        </div>
      </section>
      {showAddToCart && (
        <>
          {isAddToCartOpen && (
            <Suspense>
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
            <Suspense>
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

const NavigationButton = ({ navigation, isActive, onClick = () => {} }) => {
  const { collection = "", icon = "", text, link = "" } = navigation || {};
  const isCustomBlock =
    !!navigation?.type && navigation?.type !== "collection-item";

  if (collection || isCustomBlock) {
    return (
      <button
        className={`fx-nav-button ${styles.navigation} ${isActive ? styles.activeLink : ""}`}
        onClick={onClick}
      >
        <NavigationButtonContent
          icon={icon}
          text={isCustomBlock ? navigation?.label : text}
        />
      </button>
    );
  }
  return (
    <FDKLink
      className={`fx-nav-button ${styles.navigation} ${isActive ? styles.activeLink : ""}`}
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
  label:
    "t:resource.sections.multi_collection_product_list.multi_collection_product_list",
  props: [
    {
      type: "text",
      id: "heading",
      default: "",
      label: "t:resource.common.heading",
    },
    {
      type: "textarea",
      id: "description",
      default: "",
      label: "t:resource.common.description",
      info: "t:resource.sections.multi_collection_product_list.description_info",
    },
    {
      type: "range",
      id: "per_row",
      min: 2,
      max: 6,
      step: 1,
      unit: "",
      label:
        "t:resource.sections.multi_collection_product_list.products_per_row",
      default: 4,
      info: "t:resource.sections.multi_collection_product_list.max_products_per_row",
    },
    {
      id: "position",
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
      label:
        "t:resource.sections.multi_collection_product_list.header_position",
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
      type: "checkbox",
      id: "viewAll",
      default: false,
      label: "t:resource.sections.multi_collection_product_list.show_view_all",
      info: "t:resource.sections.multi_collection_product_list.view_all_requires_heading",
    },
    {
      type: "checkbox",
      id: "img_fill",
      category: "Image Container",
      default: true,
      label: "t:resource.common.fit_image_to_container",
      info: "t:resource.common.clip_image_to_fit_container",
    },
    {
      type: "checkbox",
      id: "show_wishlist_icon",
      label: "t:resource.common.show_wish_list_icon",
      default: true,
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
      id: "enable_sales_badge",
      label: "t:resource.sections.products_listing.enable_sales_badge",
      default: true,
    },
    {
      type: "checkbox",
      id: "mandatory_pincode",
      label: "t:resource.common.show_hide_mandatory_delivery_check",
      info: "t:resource.pages.wishlist.show_hide_mandatory_delivery_check_info",
      default: true,
    },
    {
      type: "checkbox",
      id: "hide_single_size",
      label: "t:resource.common.hide_single_size",
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
  blocks: [
    {
      type: "collection-item",
      name: "t:resource.common.navigation",
      props: [
        {
          type: "header",
          value:
            "t:resource.sections.multi_collection_product_list.icon_or_navigation_name_mandatory",
        },
        {
          type: "image_picker",
          id: "icon_image",
          label: "t:resource.common.icon",
          default: "",
        },
        {
          type: "text",
          id: "navigation",
          label:
            "t:resource.sections.multi_collection_product_list.navigation_name",
          default: "",
        },
        {
          type: "collection",
          id: "collection",
          label: "t:resource.sections.featured_collection.collection",
          info: "t:resource.sections.featured_collection.select_collection_for_products",
        },
        {
          type: "url",
          id: "redirect_link",
          label: "t:resource.sections.featured_collection.button_link",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.common.navigation",
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
      first: 20,
      pageNo: 1,
    };

    return fpi.executeGQL(FEATURED_COLLECTION, payload).then((res) => {
      const items = res?.data?.collection?.products?.items ?? [];
      return fpi.custom.setValue(`mcpl-${slug}`, items);
    });
  }
};
export default Component;
