import React, { useEffect, useMemo, useState, useRef } from "react";
import { FDKLink } from "fdk-core/components";
import OutsideClickHandler from "react-outside-click-handler";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button";
import Loader from "@gofynd/theme-template/components/loader/loader";
import styles from "./product-description.less";

import SvgWrapper from "../../../components/core/svgWrapper/SvgWrapper";
import useProductDescription from "./useProductDescription";
import PdpImageGallery from "../components/image-gallery/image-gallery";
import ProductVariants from "../components/product-variants/product-variants";
import SizeGuide from "../size-guide/size-guide";
import FyImage from "../../../components/core/fy-image/fy-image";
import DeliveryInfo from "../components/delivery-info/delivery-info";
import Offers from "../components/offers/offers";
import ProdDesc from "../components/prod-desc/prod-desc";
import BreadCrumb from "../components/breadcrumb/breadcrumb";
import Badges from "../components/badges/badges";
import ProductCompareButton from "../../compare/product-compare-button";
import StickyAddToCart from "../components/sticky-addtocart/sticky-addtocart";
import { isEmptyOrNull, isRunningOnClient } from "../../../helper/utils";
import "@gofynd/theme-template/components/loader/loader.css";
import MoreOffers from "../components/offers/more-offers";
import ShareItom from "../../../components/share-item/share-item";

function ProductDescriptionPdp({ fpi, slug }) {
  const addToCartBtnRef = useRef(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const {
    productDetails,
    isLoading,
    isLoadingPriceBySize,
    productPriceBySlug,
    productMeta,
    currentPincode,
    pageConfig,
    globalConfig,
    coupons,
    followed,
    promotions,
    selectPincodeError,
    pincodeErrorMessage,
    isIntlShippingEnabled,
    sellerDetails,
    updateIntlLocation,
    setCurrentSize,
    setCurrentPincode,
    addToWishList,
    removeFromWishlist,
    addProductForCheckout,
    checkPincode,
    setPincodeErrorMessage,
    isPageLoading,
    pincodeDetails,
    locationDetails,
  } = useProductDescription(fpi, slug);
  const priceDataDefault = productMeta?.price;
  const [selectedSize, setSelectedSize] = useState("");
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showMoreOffers, setShowMoreOffers] = useState(false);
  const [sidebarActiveTab, setSidebarActiveTab] = useState("coupons");
  const [errMessage, setErrorMessage] = useState("");
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const {
    media,
    grouped_attributes,
    name,
    short_description,
    variants,
    sizes,
  } = productDetails;

  const isMto = productDetails?.custom_order?.is_custom_order || false;

  const {
    show_price,
    disable_cart,
    button_options,
    custom_button_text,
    custom_button_link,
    custom_button_icon,
  } = globalConfig;

  const priceDataBySize = productPriceBySlug?.price;
  const isSizeSelectionBlock = pageConfig?.size_selection_style === "block";
  const isSingleSize = sizes?.sizes?.length === 1;
  const isSizeCollapsed = pageConfig?.hide_single_size && isSingleSize;
  const preSelectFirstOfMany = pageConfig?.preselect_size;
  const { show_size_guide = true } = pageConfig;

  useEffect(() => {
    const detectMobileWidth = () =>
      document?.getElementsByTagName("body")?.[0]?.getBoundingClientRect()
        ?.width <= 768;
    const handleResize = () => {
      setIsMobile(detectMobileWidth());
    };
    if (isRunningOnClient()) {
      window.addEventListener("resize", handleResize);
      handleResize();
    }
    return () => {
      if (isRunningOnClient()) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  function getManufacturingTime() {
    const custom_order = productDetails?.custom_order;

    if (
      custom_order?.manufacturing_time >= 0 &&
      custom_order?.manufacturing_time_unit
    ) {
      return custom_order;
    }

    return false;
  }

  const getProductPrice = (key) => {
    if (selectedSize && !isEmptyOrNull(productPriceBySlug)) {
      if (productPriceBySlug?.set) {
        return productPriceBySlug?.price_per_piece[key] || "";
      }
      const price = productPriceBySlug?.price || "";
      return `${price?.currency_symbol || ""} ${price?.[key] || ""}`;
    }
    if (priceDataDefault) {
      return priceDataDefault?.[key]?.min !== priceDataDefault?.[key]?.max
        ? `${priceDataDefault?.[key]?.currency_symbol || ""} ${
            priceDataDefault?.[key]?.min || ""
          } - ${priceDataDefault?.[key]?.max || ""}`
        : `${priceDataDefault?.[key]?.currency_symbol || ""} ${
            priceDataDefault?.[key]?.max || ""
          } `;
    }
  };

  const onSizeSelection = (size) => {
    if (size?.quantity === 0 && !isMto) {
      return;
    }
    setSelectedSize(size?.value);
    setCurrentSize(size);
    setShowSizeDropdown(false);
  };

  useEffect(() => {
    if (isSizeCollapsed || (preSelectFirstOfMany && sizes !== undefined)) {
      onSizeSelection(sizes?.sizes?.[0]);
    }
  }, [isSizeCollapsed, preSelectFirstOfMany, sizes?.sizes]);

  // function getReviewRatingInfo() {
  //   const customMeta = productDetails?.custom_meta || [];

  //   return getReviewRatingData(customMeta);
  // }

  const isSizeGuideAvailable = useMemo(() => {
    const sizeChartHeader = productMeta?.size_chart?.headers || {};
    return (
      Object.keys(sizeChartHeader).length > 0 || productMeta?.size_chart?.image
    );
  }, [productMeta]);

  if (isRunningOnClient() && isPageLoading) {
    return (
      <div className={styles.loader}>
        <Loader
          containerClassName={styles.loaderContainer}
          loaderClassName={styles.customLoader}
        />
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: "Amazing Product",
          text: "Check out this amazing product on fynd!",
          url: window?.location?.href,
        });
      } catch (error) {
        console.error("Sharing failed", error);
      }
    } else setShowSocialLinks(true);
  };
  return (
    <>
      <div className={`${styles.mainContainer} fontBody`}>
        <BreadCrumb
          productData={productDetails}
          pageConfig={pageConfig}
          customClass={styles.isDesktop}
        />
        <div className={styles.productDescContainer}>
          <div className={styles.left}>
            {media?.length > 0 && (
              <div className={styles.imgWrap}>
                <PdpImageGallery
                  key={slug}
                  images={media}
                  product={productDetails}
                  iconColor={pageConfig?.icon_color || ""}
                  globalConfig={globalConfig}
                  followed={followed}
                  removeFromWishlist={removeFromWishlist}
                  addToWishList={addToWishList}
                  isLoading={isLoading}
                  handleShare={() => handleShare()}
                />
              </div>
            )}
          </div>
          <div className={styles.right}>
            <div className={styles.product}>
              <BreadCrumb
                productData={productDetails}
                pageConfig={pageConfig}
                customClass={styles.isMobile}
              />
              {/* ---------- Product Name ----------  */}
              <h1
                className={`${styles.product__title} h2 ${styles.fontHeader} fontHeader`}
              >
                {name}
                <span>
                  <SvgWrapper
                    svgSrc="shareDesktop"
                    className={styles.shareIcon}
                    onClick={() => handleShare()}
                  />
                </span>
              </h1>
              {/* ---------- Product Price ---------- */}
              {show_price && !isLoading && productMeta?.sellable && (
                <div className={styles.product__price}>
                  {getProductPrice("effective") &&
                    pageConfig?.mrp_label &&
                    getProductPrice("effective") ===
                      getProductPrice("marked") && (
                      <span
                        className={`${styles.mrpLabel} ${styles["mrpLabel--effective"]}`}
                        style={{ marginLeft: 0 }}
                      >
                        MRP:
                      </span>
                    )}
                  <h4 className={styles["product__price--effective"]}>
                    {getProductPrice("effective")}
                  </h4>
                  {getProductPrice("marked") &&
                    pageConfig?.mrp_label &&
                    getProductPrice("effective") !==
                      getProductPrice("marked") && (
                      <span
                        className={`${styles.mrpLabel} ${styles["mrpLabel--marked"]}`}
                      >
                        &nbsp;MRP:
                      </span>
                    )}
                  {getProductPrice("effective") !==
                    getProductPrice("marked") && (
                    <span className={styles["product__price--marked"]}>
                      {getProductPrice("marked")}
                    </span>
                  )}
                  {productPriceBySlug?.discount && (
                    <span className={styles["product__price--discount"]}>
                      {productPriceBySlug?.discount}
                    </span>
                  )}
                </div>
              )}
              {/* ---------- Product Tax Label ---------- */}
              {pageConfig?.tax_label && productMeta?.sellable && (
                <div className={`captionNormal ${styles.taxLabel}`}>
                  {pageConfig?.tax_label}
                </div>
              )}
              {/* ---------- Product Rating ---------- */}
              {/* {getReviewRatingInfo.avg_ratings ||
  (getReviewRatingInfo.review_count && (
    <div class="review-rating-container">
      {getReviewRatingInfo.avg_ratings && (
        <div class="rating-wrapper">
          <span class="b1">
            {getReviewRatingInfo.avg_ratings}
          </span>
          <SvgWrapper
            svgSrc="star"
            className={styles.ratingIcon}
          />
        </div>
      )}
      {getReviewRatingInfo.avg_ratings &&
        getReviewRatingInfo.review_count && (
          <div className={styles.separator}>&nbsp;</div>
        )}
      {getReviewRatingInfo.review_count && (
        <div
          class={`${styles.reviewWrapper} captionNormal`}
        >
          {getReviewRatingInfo.review_count +
            ` Review${
              getReviewRatingInfo.review_count > 1 ? "s" : ""
            }`}
        </div>
      )}
    </div>
  ))} */}
              {/* ---------- Short Description ----------  */}
              {short_description?.length > 0 && (
                <p
                  className={`b2 ${styles.fontBody} ${styles.shortDescription}`}
                >
                  {short_description}
                </p>
              )}
              {/* ---------- Product Variants ----------  */}
              {variants?.length > 0 && (
                <div>
                  <ProductVariants
                    product={productDetails}
                    variants={variants}
                    currentSlug={slug}
                    globalConfig={globalConfig}
                  />
                </div>
              )}
              {/* ---------- Seller Details ---------- */}
              {pageConfig?.show_seller &&
                selectedSize &&
                !isEmptyOrNull(productPriceBySlug) && (
                  <div className={`${styles.sellerInfo} ${styles.fontBody}`}>
                    <div className={`${styles.storeSeller} captionNormal`}>
                      <span className={styles.soldByLabel}>Seller :</span>
                      <div
                        // v-if="showSellerStoreLabel"
                        className={`${styles.nameWrapper} ${
                          pageConfig?.seller_store_selection &&
                          styles.selectable
                        }`}
                        // @click="onSellerClick(sellerData.loadStores)"
                      >
                        <p className={styles.storeSellerName}>
                          {`${productPriceBySlug?.seller?.name || ""}`}
                        </p>
                        {productPriceBySlug?.seller?.count > 1 && (
                          <span
                            className={`captionSemiBold ${styles.otherSellers}`}
                          >
                            &nbsp;&&nbsp;
                            {`${(productPriceBySlug?.seller?.count ?? 2) - 1} Other${
                              productPriceBySlug?.seller?.count > 1 > 2
                                ? "s"
                                : ""
                            }`}
                          </span>
                        )}
                        {pageConfig?.seller_store_selection && (
                          <SvgWrapper
                            svgSrc="arrow-down"
                            className={styles.dropdownArrow}
                          />
                        )}
                      </div>
                    </div>
                    {/* <store-modal
      :is-open="showStoreModal"
      :active-store-info="storeInfo"
      :all_stores_info="all_stores_info"
      :seller-data="sellerData"
      :app_features="context.app_features"
      @closedialog="toggleStoreSidebar"
      @store-filter="updateStoreFilter"
      @store-item-select="setStoreInfo"
    ></store-modal> */}
                  </div>
                )}
              {/* ---------- Size Container ---------- */}
              <div className={styles.sizeContainer}>
                {isSizeSelectionBlock && productMeta?.sellable && (
                  <div
                    className={`${styles.sizeSelection} ${
                      isSizeCollapsed ? styles["sizeSelection--collapse"] : ""
                    }`}
                  >
                    <div>
                      <p className={`b2 ${styles.sizeSelection__label}`}>
                        <span>Size :</span>
                      </p>

                      <div className={styles.sizeSelection__wrapper}>
                        {sizes?.sizes?.map((size) => (
                          <button
                            type="button"
                            key={`${size?.display}`}
                            className={`b2 ${styles.sizeSelection__block} ${
                              size.quantity === 0 &&
                              !isMto &&
                              styles["sizeSelection__block--disable"]
                            } ${
                              (size?.quantity !== 0 || isMto) &&
                              styles["sizeSelection__block--selectable"]
                            } ${
                              selectedSize === size?.value &&
                              styles["sizeSelection__block--selected"]
                            } `}
                            title={size?.value}
                            onClick={() => onSizeSelection(size)}
                          >
                            {size?.display}
                            {size?.quantity === 0 && !isMto && (
                              <svg>
                                <line x1="0" y1="100%" x2="100%" y2="0" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* ---------- Size Guide ---------- */}
              {show_size_guide &&
                isSizeGuideAvailable &&
                productMeta?.sellable && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className={`${styles["product__size--guide"]} ${styles.buttonFont} ${styles.fontBody}`}
                    >
                      <span>SIZE GUIDE</span>
                      <SvgWrapper svgSrc="scale" className={styles.scaleIcon} />
                    </button>
                  </div>
                )}
              {/* ---------- Size Dropdown And Action Buttons ---------- */}
              <div className={styles.sizeCartContainer}>
                {pageConfig?.size_selection_style === "dropdown" &&
                  productMeta?.sellable && (
                    <div
                      className={`${styles.sizeWrapper} ${
                        isSizeCollapsed && styles["sizeWrapper--collapse"]
                      }`}
                    >
                      <div
                        className={` ${styles.sizeButton} ${
                          styles.flexAlignCenter
                        } ${styles.justifyBetween} ${styles.fontBody} ${
                          sizes?.sizes?.length && styles.disabledButton
                        }`}
                        onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                        disabled={!sizes?.sizes?.length}
                      >
                        <p
                          className={`${styles.buttonFont} ${styles.selectedSize}`}
                          title={
                            selectedSize
                              ? `Size : ${selectedSize}`
                              : "SELECT SIZE"
                          }
                        >
                          {selectedSize
                            ? `Size : ${selectedSize}`
                            : "SELECT SIZE"}
                        </p>
                        <SvgWrapper
                          svgSrc="arrow-down"
                          className={`${styles.dropdownArrow} ${
                            showSizeDropdown && styles.rotateArrow
                          }`}
                        />
                      </div>
                      <OutsideClickHandler
                        onOutsideClick={() => {
                          setShowSizeDropdown(false);
                        }}
                      >
                        <ul
                          className={styles.sizeDropdown}
                          style={{
                            display: showSizeDropdown ? "block" : "none",
                          }}
                        >
                          {sizes?.sizes?.map((size) => (
                            <li
                              onClick={() => onSizeSelection(size)}
                              key={size?.value}
                              className={`${
                                selectedSize === size.display &&
                                styles.selected_size
                              } ${
                                size.quantity === 0 && !isMto
                                  ? styles.disabled_size
                                  : styles.selectable_size
                              }`}
                            >
                              {size.display}
                            </li>
                          ))}
                        </ul>
                      </OutsideClickHandler>
                    </div>
                  )}

                {button_options?.includes("addtocart") && (
                  <div
                    className={`${styles.cartWrapper} ${
                      isSizeSelectionBlock && styles["cartWrapper--half-width"]
                    }`}
                  >
                    {!disable_cart && productMeta?.sellable && (
                      <FyButton
                        ref={addToCartBtnRef}
                        type="button"
                        className={`${styles.button} btnSecondary ${styles.flexCenter} ${styles.addToCart} ${styles.fontBody}`}
                        onClick={(e) =>
                          addProductForCheckout(e, selectedSize, false)
                        }
                        disabled={isLoadingPriceBySize}
                        startIcon={
                          <SvgWrapper
                            svgSrc="cart"
                            className={styles.cartIcon}
                          />
                        }
                      >
                        ADD TO CART
                      </FyButton>
                    )}
                    {!productMeta?.sellable && (
                      <button
                        type="button"
                        disabled
                        className={`${styles.button} btnPrimary ${styles.notAvailable} ${styles.fontBody}`}
                      >
                        PRODUCT NOT AVAILABLE
                      </button>
                    )}
                  </div>
                )}

                {button_options?.includes("buynow") &&
                  isSizeSelectionBlock &&
                  productMeta?.sellable && (
                    <div
                      className={`${styles.actionBuyNow} ${
                        button_options?.includes("addtocart") &&
                        styles["actionBuyNow--ml-12"]
                      }`}
                    >
                      {!disable_cart && productMeta?.sellable && (
                        <button
                          type="button"
                          className={`${styles.button} btnPrimary ${styles.buyNow} ${styles.fontBody}`}
                          onClick={(e) =>
                            addProductForCheckout(e, selectedSize, true)
                          }
                          disabled={isLoadingPriceBySize}
                        >
                          <SvgWrapper
                            svgSrc="buy-now"
                            className={styles.buyNow__icon}
                          />
                          BUY NOW
                        </button>
                      )}
                    </div>
                  )}
              </div>
              {/* ---------- Buy Now and Custom Button ---------- */}
              {button_options?.includes("buynow") && !isSizeSelectionBlock && (
                <div className={styles.actionBuyNow}>
                  {!disable_cart && productMeta?.sellable && (
                    <button
                      type="button"
                      className={`${styles.button} btnPrimary ${styles.buyNow} ${styles.fontBody}`}
                      onClick={(e) =>
                        addProductForCheckout(e, selectedSize, true)
                      }
                      disabled={isLoadingPriceBySize}
                    >
                      <SvgWrapper
                        svgSrc="buy-now'"
                        className={styles.buyNow__icon}
                      />
                      BUY NOW
                    </button>
                  )}
                </div>
              )}

              {custom_button_text && button_options?.includes("button") && (
                <FDKLink to={custom_button_link}>
                  <button
                    type="button"
                    className={`${styles.button} btnPrimary ${styles.buyNow} ${styles.fontBody}`}
                  >
                    {custom_button_icon && (
                      <FyImage
                        customClass={styles.customIcon}
                        src={custom_button_icon}
                        globalConfig={globalConfig}
                      />
                    )}
                    {custom_button_text}
                  </button>
                </FDKLink>
              )}

              {/* ---------- Pincode ---------- */}
              {productMeta?.sellable && selectedSize && (
                <DeliveryInfo
                  pincode={currentPincode}
                  tat={productPriceBySlug?.delivery_promise}
                  selectPincodeError={selectPincodeError}
                  pincodeErrorMessage={pincodeErrorMessage}
                  setCurrentPincode={setCurrentPincode}
                  setErrorMessage={setErrorMessage}
                  checkPincode={checkPincode}
                  fpi={fpi}
                  setPincodeErrorMessage={setPincodeErrorMessage}
                  isIntlShippingEnabled={isIntlShippingEnabled}
                  sellerDetails={sellerDetails}
                  updateIntlLocation={updateIntlLocation}
                  pincodeDetails={pincodeDetails}
                  locationDetails={locationDetails}
                />
              )}
              {pageConfig?.add_to_compare && (
                <ProductCompareButton
                  customClass={styles.compareBtn}
                  fpi={fpi}
                  slug={slug}
                />
              )}

              {/* ---------- Offers---------- */}
              {productMeta?.sellable && pageConfig?.show_offers && (
                <Offers
                  couponsList={coupons}
                  promotionsList={promotions}
                  setShowMoreOffers={setShowMoreOffers}
                  setSidebarActiveTab={setSidebarActiveTab}
                />
              )}
              {/* ----------Prod Meta ---------- */}
              <ul className={`${styles.productDetail} ${styles.fontBody}`}>
                {pageConfig?.return && (
                  <>
                    {productPriceBySlug?.return_config?.returnable && (
                      <li className={styles.b2}>
                        {`${productPriceBySlug?.return_config?.time} ${productPriceBySlug?.return_config?.unit} return`}
                      </li>
                    )}
                    {/* v-else-if="returnConfig.returnable === false"  */}
                    {!productPriceBySlug?.return_config?.returnable &&
                      selectedSize && (
                        <li className={styles.b2}>
                          No return available on this product
                        </li>
                      )}
                  </>
                )}
                {getManufacturingTime() && selectedSize && (
                  <li className={styles.b2}>
                    {`Shipping within ${productDetails?.custom_order?.manufacturing_time} ${productDetails?.custom_order?.manufacturing_time_unit}`}
                  </li>
                )}
                {pageConfig?.item_code && productDetails?.item_code && (
                  <li className={styles.b2}>
                    Item code : {productDetails?.item_code}
                  </li>
                )}
              </ul>

              {/* ---------- Trust Markers ---------- */}
              <Badges pageConfig={pageConfig} />

              {/* ---------- Prod Desc ---------- */}
              {pageConfig.variant_position === "accordion" && (
                <div className={styles.productDescDesktop}>
                  <ProdDesc product={productDetails} pageConfig={pageConfig} />
                </div>
              )}
            </div>
            {showSocialLinks && (
              <ShareItom
                setShowSocialLinks={setShowSocialLinks}
                handleShare={() => handleShare()}
              />
            )}
          </div>
        </div>
        <ProdDesc
          customClass={
            pageConfig.variant_position === "tabs"
              ? ""
              : styles.productDescMobileAcc
          }
          product={productDetails}
          pageConfig={pageConfig}
        />
      </div>

      {button_options?.includes("addtocart") &&
        !disable_cart &&
        productMeta?.sellable && (
          <StickyAddToCart
            addToCartBtnRef={addToCartBtnRef}
            productMeta={productMeta}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            pageConfig={pageConfig}
            sizes={sizes}
            getProductPrice={getProductPrice}
            addProductForCheckout={addProductForCheckout}
            onSizeSelection={onSizeSelection}
            productPriceBySlug={productPriceBySlug}
            isSizeGuideAvailable={show_size_guide && isSizeGuideAvailable}
            deliveryInfoProps={{
              pincode: currentPincode,
              tat: productPriceBySlug?.delivery_promise,
              selectPincodeError,
              pincodeErrorMessage,
              setCurrentPincode,
              setErrorMessage,
              checkPincode,
              fpi,
              isIntlShippingEnabled,
              sellerDetails,
              updateIntlLocation,
              productDetails,
              locationDetails,
            }}
          />
        )}
      <MoreOffers
        isOpen={showMoreOffers}
        onCloseDialog={() => setShowMoreOffers(false)}
        couponsList={coupons}
        promotionsList={promotions}
        sidebarActiveTab={sidebarActiveTab}
      />
      <SizeGuide
        customClass={styles.sizeGuide}
        isOpen={showSizeGuide}
        productMeta={productMeta}
        onCloseDialog={() => setShowSizeGuide(false)}
      />
      {/* {isLoading && <Loader />} */}
    </>
  );
}

export default ProductDescriptionPdp;
