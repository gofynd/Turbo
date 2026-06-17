import React, { useState, useCallback } from "react";
import { useGlobalTranslation } from "fdk-core/utils";
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import "@gofynd/theme-template/components/core/modal/modal.css";
import styles from "./minicart.less";
import DecreaseIcon from "../../assets/images/decrease-icon.svg";
import IncreaseIcon from "../../assets/images/increase-icon.svg";
import PercentDiscountIcon from "../../assets/images/percent-discount-icon.svg";
import PriceBreakup from "@gofynd/theme-template/components/price-breakup/price-breakup";
import "@gofynd/theme-template/components/price-breakup/price-breakup.css";
import FyInput from "@gofynd/theme-template/components/core/fy-input/fy-input";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";
import GstCard from "@gofynd/theme-template/page-layouts/cart/Components/gst-card/gst-card";
import "@gofynd/theme-template/page-layouts/cart/Components/gst-card/gst-card.css";
import ArrowDown from "../../assets/images/arrow-down-mini.svg";
import ArrowUp from "../../assets/images/arrow-up-mini.svg";
import Shimmer from "../shimmer/shimmer";
import { CouponSuccessModal } from "@gofynd/theme-template/page-layouts/cart/Components/coupon/coupon";
import "@gofynd/theme-template/page-layouts/cart/Components/coupon/coupon.css";
import DeleteItemIcon from "../../assets/images/delete-minicart-item.svg";

const MiniCartOfferCard = ({
  coupon_code: code,
  title: offerTitle,
  subtitle,
  expires_on: expiresOn,
  is_applicable: isApplicable,
  applyCoupon,
  removeCoupon,
  selectedCouponCode = "",
  selectedCouponId = "",
  isCartUpdating = false,
  t,
}) => {
  const isSelected = code === selectedCouponCode && selectedCouponCode !== "";

  return (
    <div className={styles.offerCard}>
      <div className={styles.offerCardHeader}>
        <div className={styles.offerCardTitleCol}>
          <span className={styles.offerCardCodeTitle}>
            {code} - {offerTitle}
          </span>
          <span
            className={`${styles.offerCardSubtitle} ${!isApplicable ? styles.offerCardSubtitleWarn : ""}`}
          >
            {subtitle}
          </span>
        </div>

        {isSelected ? (
          <button
            type="button"
            className={styles.offerCardRemoveBtn}
            onClick={() => removeCoupon(selectedCouponId)}
          >
            {t("resource.cart.remove_coupon")}
          </button>
        ) : (
          <button
            type="button"
            className={styles.offerCardApplyBtn}
            disabled={!isApplicable || isCartUpdating}
            onClick={() => applyCoupon(code)}
          >
            {t("resource.facets.apply_caps")}
          </button>
        )}
      </div>
      {isApplicable && (
        <>
          <hr className={styles.offerCardDivider} />
          <p className={styles.offerCardExpires}>{expiresOn}</p>
        </>
      )}
    </div>
  );
};

const MiniCartNoCouponsAvailable = ({ t }) => (
  <div className={styles.noCouponsAvailable}>
    <div className={styles.noCouponsIconWrap}>
      <PercentDiscountIcon />
    </div>
    <div className={styles.noCouponsTextCol}>
      <h3 className={styles.noCouponsHeading}>
        {t("resource.cart.no_coupons_available")}
      </h3>
      <p className={styles.noCouponsBody}>
        {t("resource.cart.coupon_code_prompt")}
      </p>
    </div>
  </div>
);

const MiniCartCoupons = ({
  availableCouponList = [],
  onApplyCoupon = () => {},
  onRemoveCouponClick = () => {},
  appliedCoupon = null,
  isCartUpdating = false,
  couponId = "",
  couponCode = "",
  couponError = null,
  t,
}) => {
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [showCouponError, setShowCouponError] = useState(true);

  const selectedCouponCode =
    couponCode || (appliedCoupon?.is_applied ? appliedCoupon?.code : "") || "";
  const selectedCouponId =
    couponId || (appliedCoupon?.is_applied ? appliedCoupon?.uid : "") || "";

  const handleApplyCoupon = () => {
    const trimmed = couponInput.trim();
    if (!trimmed) return;
    setShowCouponError(true);
    onApplyCoupon(trimmed, {
      errorDisplay: "inline",
      fallbackErrorMessage: t("resource.cart.sorry_invalid_coupon"),
    });
  };

  const handleSelectCoupon = (code = "") => {
    onApplyCoupon(code, {
      errorDisplay: "toast",
      fallbackErrorMessage: t("resource.cart.sorry_invalid_coupon"),
    });
  };

  const handleCouponInputChange = (event) => {
    const { value } = event.target;
    setCouponInput(value);
    setShowCouponError(false);
  };

  const handleToggleCoupons = () => {
    setShowCoupons((prev) => {
      if (prev) {
        setCouponInput("");
        setShowCouponError(false);
      }
      return !prev;
    });
  };

  return (
    <div className={styles.couponsSection}>
      <div className={styles.couponToggle}>
        <PercentDiscountIcon />
        <div className={styles.couponTitleText}>
          {appliedCoupon?.code
            ? `${t("resource.common.applied_caps")}: ${appliedCoupon.code}`
            : "View Offers & Coupons"}
        </div>
        <button
          type="button"
          className={styles.couponToggleBtn}
          onClick={handleToggleCoupons}
        >
          {showCoupons ? "HIDE" : "SHOW"}
        </button>
      </div>
      {showCoupons && (
        <div className={styles.couponInputRow}>
          <FyInput
            containerClassName={styles.couponInput}
            inputVariant="no-border"
            type="text"
            value={couponInput}
            placeholder={t("resource.cart.enter_coupon_code")}
            onChange={handleCouponInputChange}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleApplyCoupon();
              }
            }}
            disabled={isCartUpdating}
          />
          <button
            type="button"
            className={styles.couponApplyBtn}
            onClick={handleApplyCoupon}
            disabled={!couponInput.trim() || isCartUpdating}
          >
            {t("resource.facets.apply_caps")}
          </button>
        </div>
      )}
      {showCoupons && showCouponError && couponError?.message && (
        <div className={styles.couponError}>{couponError.message}</div>
      )}
      {showCoupons &&
        (availableCouponList?.length > 0 ? (
          <div className={styles.couponListTitleWrapper}>
            <div className={styles.bestOfferContainer}>
              {availableCouponList.map((coupon) => (
                <MiniCartOfferCard
                  key={coupon?.coupon_code}
                  coupon_code={coupon?.coupon_code}
                  title={coupon?.title}
                  subtitle={coupon?.sub_title}
                  expires_on={coupon?.expires_on}
                  applyCoupon={handleSelectCoupon}
                  removeCoupon={onRemoveCouponClick}
                  selectedCouponCode={selectedCouponCode}
                  selectedCouponId={selectedCouponId}
                  is_applicable={coupon?.is_applicable}
                  isCartUpdating={isCartUpdating}
                  t={t}
                />
              ))}
            </div>
          </div>
        ) : (
          <MiniCartNoCouponsAvailable t={t} />
        ))}
    </div>
  );
};

const MiniCartBillSummary = ({
  breakUpValues = [],
  cartItemCount = 0,
  currencySymbol = "",
  isLoading = false,
  showCartDiscountPreview = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.billSummary}>
      <button
        className={styles.billSummaryToggle}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>Bill Summary</span>
        <span>{isOpen ? <ArrowUp /> : <ArrowDown />}</span>
      </button>

      {isOpen && (
        <PriceBreakup
          breakUpValues={breakUpValues}
          cartItemCount={cartItemCount}
          currencySymbol={currencySymbol}
          isInternationalTaxLabel={false}
          isLoading={isLoading}
          showTotalDiscount={showCartDiscountPreview}
          cardBorderRadius="0px"
          priceSummaryContainerClass={styles.priceSummaryContainer}
        />
      )}
    </div>
  );
};

const MiniCartFreeGifts = ({ freeGiftItems = [], t, onNavigateToProduct }) => {
  if (!freeGiftItems.length) return null;

  return (
    <div className={styles.freeGiftsSection}>
      <div className={styles.freeGiftsHeader}>
        {freeGiftItems.length} Free gifts Added
      </div>
      <div className={styles.freeGiftsList}>
        {freeGiftItems.map((gift) => (
          <div className={styles.freeGiftCard} key={gift.key}>
            {gift.image ? (
              <div
                className={styles.freeGiftImage}
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => gift.slug && onNavigateToProduct?.(gift.slug)}
                onKeyDown={(event) => {
                  if (
                    (event.key === "Enter" || event.key === " ") &&
                    gift.slug
                  ) {
                    event.preventDefault();
                    onNavigateToProduct?.(gift.slug);
                  }
                }}
              >
                <img src={gift.image} alt={gift.name} />
              </div>
            ) : (
              <div className={styles.freeGiftImageFallback} />
            )}
            <div className={styles.freeGiftInfo}>
              <div className={styles.freeGiftName}>
                {gift.name || t("resource.cart.free_gift_added")}
              </div>
              {gift.quantity ? (
                <div className={styles.freeGiftQty}>
                  {t("resource.common.quantity")}: {gift.quantity}
                </div>
              ) : null}
              <div className={styles.freeGiftTag}>
                {t("resource.common.free")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MiniCartItem = ({
  item,
  index,
  formatAmount,
  t,
  isCartUpdating,
  onQuantityChange,
  onRemove,
  onNavigateToProduct = () => {},
}) => {
  const thumbnailUrl = item?.product?.images?.[0]?.url;
  const color = item?.product?.attributes?.color;
  const effectivePrice =
    item?.price?.converted?.effective ?? item?.price?.base?.effective;
  const markedPrice =
    item?.price?.converted?.marked ?? item?.price?.base?.marked;
  const showDiscount = markedPrice && effectivePrice < markedPrice;
  return (
    <div className={styles.item}>
      <div
        className={styles.thumbnailWrapper}
        role="button"
        tabIndex={0}
        style={{ cursor: "pointer" }}
        onClick={() => onNavigateToProduct(item?.product?.slug)}
        onKeyDown={(event) => {
          if (
            (event.key === "Enter" || event.key === " ") &&
            item?.product?.slug
          ) {
            event.preventDefault();
            onNavigateToProduct(item?.product?.slug);
          }
        }}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl.replace("original", "resize-w:200")}
            alt={item?.product?.name}
            className={styles.thumbnail}
          />
        ) : (
          <div className={styles.thumbnailFallback} />
        )}
      </div>
      <div className={styles.itemInfo}>
        <div className={styles.brandRows}>
          <div className={styles.brandName}>{item?.product?.brand?.name}</div>
          <div className={styles.name}>{item?.product?.name}</div>
        </div>
        <div className={styles.sizeAndColor}>
          <div className={styles.size}>
            {t("resource.common.size")}: {item?.article?.size || ""}
          </div>
          {color && <div>|</div>}
          {color && <div className={styles.color}>Colour: {color}</div>}
        </div>
        <div className={styles.priceRow}>
          <div className={styles.itemPrice}>
            <span className={styles.effectivePrice}>
              {formatAmount(effectivePrice)}
            </span>
            {showDiscount && (
              <span className={styles.markedPrice}>
                {formatAmount(markedPrice)}
              </span>
            )}
          </div>

          {item?.discount ? (
            <div className={styles.discount}>{item?.discount}</div>
          ) : null}
        </div>

        <div className={styles.qtyControls}>
          <button
            className={styles.qtyBtn}
            onClick={(event) => onQuantityChange(event, item, -1, index)}
            disabled={isCartUpdating}
          >
            <DecreaseIcon />
          </button>
          <span className={styles.qtyCount}>{item?.quantity || 0}</span>
          <button
            className={styles.qtyBtn}
            onClick={(event) => onQuantityChange(event, item, 1, index)}
            disabled={isCartUpdating}
          >
            <IncreaseIcon />
          </button>
        </div>
      </div>
      <div>
        <button
          onClick={(event) => onRemove(event, item, index)}
          disabled={isCartUpdating}
          aria-label={t("resource.common.remove")}
        >
          <DeleteItemIcon />
        </button>
      </div>
    </div>
  );
};

const Minicart = ({
  isOpen,
  onClose = () => {},
  onCheckout = () => {},
  onViewCart = () => {},
  miniCartItems = [],
  miniCartSummary = {},
  currencySymbol = "",
  isCartUpdating = false,
  onUpdateCartItems = () => {},
  cartItemCount = 0,
  isValid = true,
  isNotServicable = false,
  isOutOfStock = false,
  isLoading = false,
  availableCouponList = [],
  onApplyCoupon = () => {},
  onRemoveCouponClick = () => {},
  couponError = null,
  appliedCoupon = null,
  miniCartBreakupValues = [],
  gstDetails = {},
  isGstInput = null,
  couponSuccessGif,
  isCouponSuccessModalOpen = false,
  onCouponSuccessCloseModalClick = () => {},
  title,
  subtitle,
  couponId,
  couponCode,
  couponValue,
  hasCancel,
  isCouponListModalOpen = false,
  onCouponBoxClick = () => {},
  onCouponListCloseModalClick = () => {},
  successCoupon,
  showCartDiscountPreview = true,
}) => {
  const { t } = useGlobalTranslation("translation");

  const freeGiftItems = React.useMemo(() => {
    const gifts = [];
    miniCartItems?.forEach((item) => {
      item?.promotions_applied?.forEach((promotion) => {
        if (promotion?.promotion_type !== "free_gift_items") return;
        promotion?.applied_free_articles?.forEach((gift) => {
          const details = gift?.free_gift_item_details || {};
          const giftImage = details?.item_images_url?.[0] || "";
          gifts.push({
            key: gift?.article_id || details?.item_id,
            name: details?.item_name || "",
            quantity: gift?.quantity,
            slug: details?.item_slug,
            image: giftImage
              ? giftImage.replace("original", "resize-w:140")
              : "",
          });
        });
      });
    });
    return gifts;
  }, [miniCartItems]);

  const formatAmount = (amount) => {
    if (amount == null) return "";
    if (typeof amount === "string") return amount;
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) return amount;
    return `${currencySymbol}${parsedAmount.toLocaleString()}`;
  };

  const handleNavigateToProduct = useCallback(
    (slug) => {
      if (!slug) return;
      const url = `/product/${slug}`;
      if (typeof window !== "undefined") {
        window.open(url, "_blank");
      }
      onClose();
    },
    [onClose]
  );

  const handleQuantityChange = (event, item, delta, index) => {
    const size = item?.article?.size || "";
    const currentQty = item?.quantity || 0;
    const nextQty = Math.max(0, currentQty + delta);
    const operation = nextQty === 0 ? "remove_item" : "update_item";
    onUpdateCartItems(event, item, size, nextQty, index, operation);
  };

  const handleRemove = (event, item, index) => {
    const size = item?.article?.size || "";
    onUpdateCartItems(event, item, size, 0, index, "remove_item");
  };

  const shouldDisableCheckout =
    !miniCartItems.length ||
    !isValid ||
    isOutOfStock ||
    isNotServicable ||
    isCartUpdating;

  const renderShimmer = () => (
    <div className={styles.shimmerList}>
      {[0, 1, 2, 3].map((key) => (
        <div className={styles.item} key={key}>
          <div className={styles.thumbnailWrapper}>
            <Shimmer width="83px" height="100px" />
          </div>
          <div className={styles.itemInfo}>
            <Shimmer width="60%" height="14px" />
            <Shimmer width="40%" height="12px" />
            <Shimmer width="50%" height="12px" />
            <div className={styles.qtyControls}>
              <Shimmer width="28px" height="28px" />
              <Shimmer width="28px" height="28px" />
              <Shimmer width="28px" height="28px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCartBody = () => {
    if (isLoading) {
      return renderShimmer();
    }

    if (miniCartItems.length === 0) {
      return (
        <div className={styles.emptyState}>
          {t("resource.section.cart.empty_state_title")}
        </div>
      );
    }

    return (
      <>
        {miniCartItems.map((item, index) => (
          <MiniCartItem
            key={`${item?.key}-${index}`}
            item={item}
            index={index}
            formatAmount={formatAmount}
            t={t}
            isCartUpdating={isCartUpdating}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            onNavigateToProduct={handleNavigateToProduct}
          />
        ))}
        <MiniCartFreeGifts
          freeGiftItems={freeGiftItems}
          t={t}
          onNavigateToProduct={handleNavigateToProduct}
        />
        {isGstInput && (
          <div className={styles.gstCardWrapper}>
            <GstCard
              gstNumber={gstDetails?.gstNumber}
              gstCharges={gstDetails?.gstCharges}
              isApplied={gstDetails?.isApplied}
              error={gstDetails?.error}
              onGstChange={gstDetails?.onGstChange}
              onRemoveGstClick={gstDetails?.onRemoveGstClick}
              currencySymbol={currencySymbol}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        closeDialog={onClose}
        isCancelable
        modalType="right-modal"
        containerStyle={{
          width: 440,
          maxWidth: "440px",
        }}
        headerClassName={`${styles.customHeader}`}
        containerClassName={`${styles.miniCartModal}`}
        title="Cart Preview"
        titleClassName={`${styles.miniCartTitle}`}
        titleContainerStyles={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
        subTitleClassName={`${styles.miniCartSubTitle}`}
        subTitle={` (${cartItemCount || miniCartItems.length} ${" "} ${
          cartItemCount === 1
            ? t("resource.common.item")
            : t("resource.common.items")
        })`}
      >
        <div className={styles.miniCart}>
          <div className={styles.body}>{renderCartBody()}</div>

          <div className={styles.footer}>
            <MiniCartCoupons
              availableCouponList={availableCouponList}
              onApplyCoupon={onApplyCoupon}
              onRemoveCouponClick={onRemoveCouponClick}
              appliedCoupon={appliedCoupon}
              isCartUpdating={isCartUpdating}
              couponId={couponId}
              couponCode={couponCode}
              couponError={couponError}
              t={t}
            />

            <MiniCartBillSummary
              breakUpValues={miniCartBreakupValues}
              cartItemCount={cartItemCount || miniCartItems.length}
              currencySymbol={currencySymbol}
              isLoading={isLoading}
              showCartDiscountPreview={showCartDiscountPreview}
            />
            <div className={styles.actions}>
              <FyButton
                variant="outlined"
                className={styles.secondaryCta}
                onClick={onViewCart}
              >
                VIEW CART
              </FyButton>
              <FyButton
                className={styles.primaryCta}
                onClick={onCheckout}
                disabled={shouldDisableCheckout}
              >
                {t("resource.section.cart.checkout_button_caps")}
              </FyButton>
            </div>
          </div>
        </div>
      </Modal>
      <CouponSuccessModal
        isOpen={isCouponSuccessModalOpen}
        coupon={successCoupon}
        currencySymbol={currencySymbol}
        couponSuccessGif={couponSuccessGif}
        closeDialog={onCouponSuccessCloseModalClick}
      />
    </>
  );
};

export default Minicart;
