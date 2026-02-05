import React from "react";
import { useFPI, useGlobalTranslation, useGlobalStore } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import { BagImage } from "@gofynd/theme-template/components/bag/bag";
import Accordion from "@gofynd/theme-template/components/accordion/accordion";
import CartGiftItem from "@gofynd/theme-template/pages/order-status/components/cart-gift-item/cart-gift-item";
import PriceBreakup from "@gofynd/theme-template/components/price-breakup/price-breakup";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";
import "@gofynd/theme-template/pages/order-status/order-status.css";
import TrueCheckIcon from "../assets/images/true-check.svg";
import {
  numberWithCommas,
  getProductImgAspectRatio,
  convertUTCDateToLocalDate,
  formatLocale,
  translateDynamicLabel,
  getAddressStr,
  priceFormatCurrencySymbol,
  currencyFormat,
  getGroupedShipmentBags,
} from "../helper/utils";
import styles from "../styles/order-status.less";

// Order Header Component
function OrderHeader({ orderData, isLoggedIn, locale, countryCode, t }) {
  const getOrderLink = () => {
    const basePath = isLoggedIn
      ? "/profile/orders/"
      : `/order-tracking/${orderData?.order_id}`;
    return locale && locale !== "en" ? `/${locale}${basePath}` : basePath;
  };

  return (
    <div className={styles.orderStatus}>
      <div>
        <TrueCheckIcon />
      </div>
      <div className={styles.orderConfirmed}>
        {t("resource.order.order_confirmed_caps")}
      </div>
      <div className={styles.successMsg}>
        {t("resource.order.order_success")}
      </div>
      <div className={styles.orderId}>
        {t("resource.order.order_id_caps")} {": "} <span>{orderData.order_id}</span>
      </div>
      <div className={styles.orderTime}>
        {t("resource.order.placed_on")} {": "}
        <span>
          {convertUTCDateToLocalDate(
            orderData.order_created_ts || orderData.order_created_time,
            "",
            formatLocale(locale, countryCode, true)
          )}
        </span>
      </div>
      <div className={styles.trackOrderBtn}>
        <FDKLink to={getOrderLink()}>
          <FyButton
            type="button"
            variant="outlined"
            className={styles.trackOrderButton}
          >
            {t("resource.order.track_order_caps")}
          </FyButton>
        </FDKLink>
        <FDKLink to={locale && locale !== "en" ? `/${locale}` : "/"}>
          <FyButton
            variant="contained"
            color="primary"
            type="button"
            className={styles.continueShoppingButton}
          >
            {t("resource.common.continue_shopping")}
          </FyButton>
        </FDKLink>
      </div>
    </div>
  );
}

// Shipment List Component
function ShipmentList({
  orderData,
  isLoggedIn,
  locale,
  countryCode,
  getGroupedShipmentBags,
  globalConfig,
  t,
}) {
  const getOrderLink = () => {
    const basePath = isLoggedIn
      ? "/profile/orders/"
      : `/order-tracking/${orderData?.order_id}`;
    return locale && locale !== "en" ? `/${locale}${basePath}` : basePath;
  };

  return (
    <div className={`${styles.shipmentList} fontBody`}>
      {orderData?.shipments?.map((shipment, index) => (
        <ShipmentItem
          key={index}
          shipment={shipment}
          index={index}
          shipmentLength={orderData?.shipments?.length}
          orderLink={getOrderLink()}
          getGroupedShipmentBags={getGroupedShipmentBags}
          globalConfig={globalConfig}
          locale={locale}
          countryCode={countryCode}
          t={t}
        />
      ))}
    </div>
  );
}

function ShipmentItem({
  shipment,
  index,
  shipmentLength,
  orderLink,
  getGroupedShipmentBags,
  globalConfig,
  locale,
  countryCode,
  t,
}) {
  const { bags: getBags, bundleGroups } = React.useMemo(
    () => getGroupedShipmentBags(shipment?.bags, { includePromoBags: false }),
    [shipment?.bags, getGroupedShipmentBags]
  );

  const isShipmentCancelled = shipment?.shipment_status?.value === "cancelled";

  return (
    <div className={styles.shipmentItem}>
      <div className={styles.shipmentItemHead}>
        <div>
          <p className={styles.shipmentNumber}>
            {`${t("resource.common.shipment")} ${index + 1} / ${shipmentLength}`}
          </p>
          <h5 style={{ marginTop: "8px" }}>{shipment?.shipment_id}</h5>
        </div>
        <div
          className={styles.statusWrapper}
          style={{
            ...(isShipmentCancelled && {
              background: shipment?.shipment_status?.hex_code,
              color: "#fff",
            }),
          }}
        >
          {t("resource.order.status")}:{" "}
          <span>{shipment?.shipment_status?.title}</span>
        </div>
        <div
          className={styles.statusWrapperMobile}
          style={{
            ...(isShipmentCancelled && {
              background: shipment?.shipment_status?.hex_code,
              color: "#fff",
            }),
          }}
        >
          {shipment?.shipment_status?.title}
        </div>
      </div>
      <div className={styles.shipmentItemItemsData}>
        {getBags?.map((item, idx) => (
          <div key={idx} className={styles.shipmentProdItemWrapper}>
            <ProductItem
              product={item}
              orderLink={orderLink}
              bundleGroups={bundleGroups}
              globalConfig={globalConfig}
              locale={locale}
              countryCode={countryCode}
              t={t}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductItem({
  product,
  orderLink,
  bundleGroups,
  globalConfig,
  locale,
  countryCode,
  t,
}) {
  const bundleGroupId = product?.bundle_details?.bundle_group_id;
  const aspectRatio = getProductImgAspectRatio(globalConfig);
  const isBundleItem =
    product?.bundle_details?.bundle_group_id &&
    bundleGroups &&
    bundleGroups[product?.bundle_details?.bundle_group_id]?.length > 0;
  const customizationOptions =
    // eslint-disable-next-line dot-notation
    product?.meta?.["_custom_json"]?.["_display"] || [];

  // Transform customization options into accordion format (matching Firestone ChipItem logic)
  const transformedCustomizationContent = React.useMemo(() => {
    if (!customizationOptions || customizationOptions.length === 0) return [];
    
    return customizationOptions.map((option) => {
      const items = [];
      
      // Handle productCanvas type (nested value object)
      if (option.type === "productCanvas" && option.value) {
        const canvasData = option.value;
        
        if (canvasData.text) {
          items.push({ 
            key: option.key || "Text", 
            value: canvasData.text 
          });
        }
        
        if (canvasData.price || option.price) {
          items.push({ 
            key: "Price", 
            value: `${canvasData.price || option.price}` 
          });
        }
        
        if (canvasData.previewImage) {
          items.push({ 
            key: "Preview", 
            value: canvasData.previewImage, 
            type: "image",
            alt: option.key || "Customization preview",
            dimensions: canvasData.textBounds ? {
              width: canvasData.textBounds.width,
              height: canvasData.textBounds.height
            } : undefined
          });
        }
      } 
      // Handle simple string type
      else if (option.type === "string" && option.value) {
        items.push({ 
          key: option.alt || option.key, 
          value: option.value 
        });
      }
      // Handle other types with direct text/price/previewImage properties
      else {
        if (option.text) {
          items.push({ key: "Text", value: option.text });
        }
        
        if (option.price) {
          items.push({ key: "Price", value: option.price });
        }
        
        if (option.previewImage) {
          items.push({ 
            key: "Preview", 
            value: option.previewImage, 
            type: "image",
            alt: "Customization preview" 
          });
        }
      }
      return items;
    }).flat();
  }, [customizationOptions]);

  const renderCustomizationContent = () => {
    if (!transformedCustomizationContent || transformedCustomizationContent.length === 0) return null;

    return (
      <ul className={styles.accordionContentList}>
        {transformedCustomizationContent.map((content, i) => {
          if (content.type === "image") {
            const imgSrc = content.value;
            return (
              <li key={i} className={styles.accordionContentInner} style={{ marginBottom: "4px" }}>
                 <span className={styles.accordionContentKey}>
                    {content.key && <span>{content.key}: </span>}
                 </span>
                 <div className={styles.accordionContentImageItem}>
                    <img
                      src={imgSrc}
                      alt={content.alt || content.key}
                      className={styles.accordionContentImg}
                    />
                    <div className={styles.imagePreview}>
                      <img
                        src={imgSrc}
                        alt={content.alt || content.key}
                        className={styles.largePreviewImg}
                      />
                    </div>
                 </div>
              </li>
            );
          } else {
            return (
              <li key={i} className={styles.accordionContentInner} style={{ marginBottom: "4px" }}>
                {content.key && (
                  <span className={styles.accordionContentKey}>
                    {content.key}:{" "}
                  </span>
                )}
                <span className={styles.accordionContentValue}>
                  {content.value}
                </span>
              </li>
            );
          }
        })}
      </ul>
    );
  };

  const [items, setItems] = React.useState([
    {
      title: "Customization",
      content: renderCustomizationContent(),
      open: false,
    },
  ]);

  // Update items state when transformed content changes
  React.useEffect(() => {
      setItems(prev => {
          const newContent = renderCustomizationContent();
          // Only update if content changed to avoid infinite loop (simple check)
          if(prev[0].content !== newContent) {
              return [{
                  ...prev[0],
                  content: newContent
              }];
          }
          return prev;
      })
  }, [transformedCustomizationContent]);


  const handleItemClick = (index) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        open: !updatedItems[index].open,
      };
      return updatedItems;
    });
  };

  const { name, brand, size, itemQty, markedPrice, effectivePrice } =
    React.useMemo(() => {
      if (isBundleItem) {
        const bundleBags = bundleGroups[bundleGroupId] || [];

        const totalEffectivePrice = bundleBags.reduce((sum, bag) => {
          const isAggregated =
            bag?.bundle_details?.is_base &&
            bag?.prices?.price_effective >
              (bag?.financial_breakup?.[0]?.price_effective ||
                bag?.prices?.price_effective);

          if (isAggregated) {
            return sum + (bag?.financial_breakup?.[0]?.price_effective || 0);
          }

          return sum + (bag?.prices?.price_effective || 0);
        }, 0);

        const totalMarkedPrice = bundleBags.reduce((sum, bag) => {
          const isAggregated =
            bag?.bundle_details?.is_base &&
            bag?.prices?.price_marked >
              (bag?.financial_breakup?.[0]?.price_marked ||
                bag?.prices?.price_marked);

          if (isAggregated) {
            return sum + (bag?.financial_breakup?.[0]?.price_marked || 0);
          }

          return sum + (bag?.prices?.price_marked || 0);
        }, 0);

        return {
          name: product?.bundle_details?.name,
          brand: "",
          size: "",
          itemQty: product?.bundle_details?.bundle_count,
          markedPrice: totalMarkedPrice,
          effectivePrice: totalEffectivePrice,
        };
      }
      return {
        name: product?.item?.name,
        brand: product?.item?.brand?.name,
        size: product?.item?.size,
        itemQty: product?.quantity,
        markedPrice: product?.prices?.price_marked,
        effectivePrice: product?.prices?.price_effective,
      };
    }, [product, isBundleItem, bundleGroups, bundleGroupId]);

  const getGiftItem = React.useMemo(() => {
    const bagItem = { ...product };
    if (bagItem.applied_promos) {
      // Sanitize applied_promos to ensure item_images_url has valid values
      bagItem.promotions_applied = bagItem.applied_promos.map((promo) => ({
        ...promo,
        applied_free_articles: promo?.applied_free_articles?.map((article) => ({
          ...article,
          free_gift_item_details: article?.free_gift_item_details
            ? {
                ...article.free_gift_item_details,
                // Ensure item_images_url is an array with valid strings
                item_images_url:
                  article.free_gift_item_details.item_images_url?.filter(
                    (url) => url && typeof url === "string"
                  ) || [],
              }
            : article?.free_gift_item_details,
        })),
      }));
      delete bagItem.applied_promos;
    }
    return bagItem;
  }, [product]);

  return (
    <FDKLink to={orderLink}>
      <div className={styles.shipmentProdItem}>
        <div className={styles.prodImg}>
          <BagImage
            bag={product}
            isBundle={isBundleItem}
            aspectRatio={aspectRatio}
          />
        </div>
        <div className={styles.prodItemData}>
          <div className={styles.productDetails}>
            {brand && <div className={styles.brandName}>{brand}</div>}
            <div className={styles.productName}>{name}</div>
            <div className={styles.sizeInfo}>
              <div className={styles.sizeQuantity}>
                {size && (
                  <div className={styles.size}>
                    {t("resource.common.size")}: &nbsp;{size}
                  </div>
                )}
                <div className={styles.sizeQuantity}>
                  {t("resource.common.qty")}:&nbsp;{itemQty}
                </div>
              </div>
            </div>
            <div className={styles.paymentInfo}>
              {effectivePrice > 0 && (
                <div className={styles.effectivePrice}>
                  {currencyFormat(
                    effectivePrice,
                    product?.prices?.currency_symbol,
                    formatLocale(locale, countryCode, true)
                  )}
                </div>
              )}
              {markedPrice > 0 && effectivePrice !== markedPrice && (
                <div className={styles.markedPrice}>
                  {currencyFormat(
                    markedPrice,
                    product?.prices?.currency_symbol,
                    formatLocale(locale, countryCode, true)
                  )}
                </div>
              )}
            </div>
            {customizationOptions.length > 0 && (
              <div className={styles.productCustomizationContainer}>
                <Accordion
                  key={`${product.shipment_id}`}
                  items={items}
                  onItemClick={handleItemClick}
                />
              </div>
            )}
            {product?.meta?.gift_card?.is_gift_applied && (
              <div className={styles["gift-wrap"]}>
                <input
                  type="checkbox"
                  id={product.id}
                  disabled={product}
                  checked={product?.meta?.gift_card?.is_gift_applied}
                />
                <label htmlFor={product?.id}>
                  {t("resource.order.gift_wrap_added")}
                </label>
              </div>
            )}
            {getGiftItem?.promotions_applied?.length > 0 && (
              <div className={styles["desktop-free-gift"]}>
                <CartGiftItem bagItem={getGiftItem}></CartGiftItem>
              </div>
            )}
          </div>
        </div>
      </div>
      {getGiftItem?.promotions_applied?.length > 0 && (
        <div className={styles["mobile-free-gift"]}>
          <CartGiftItem bagItem={getGiftItem}></CartGiftItem>
        </div>
      )}
    </FDKLink>
  );
}

// Price Breakup Component
function OrderPriceBreakup({ orderData, t }) {
  const getItemCount = () => {
    return orderData?.shipments?.reduce((total, ship) => {
      total += ship.bags.length;
      return total;
    }, 0);
  };

  return (
    <>
      <PriceBreakup
        customClassName={styles.customStyles}
        breakUpValues={orderData?.breakup_values}
        cartItemCount={getItemCount()}
        currencySymbol={orderData?.breakup_values?.[0]?.currency_symbol}
      />
    </>
  );
}

// Payment Info Component
function PaymentInfo({ orderData, isLoggedIn, locale, countryCode, t }) {
  if (!isLoggedIn) {
    return null;
  }

  const paymentInfos = (orderData?.shipments || [])
    .flatMap((shipment) => shipment?.payment_info || [])
    .filter(Boolean);

  const paymentModeMap = {};

  paymentInfos.forEach((paymentInfo) => {
    const modeKey =
      // eslint-disable-next-line dot-notation
      paymentInfo?.["mode"] || paymentInfo?.display_name || "OTHER";
    if (!paymentModeMap[modeKey]) {
      paymentModeMap[modeKey] = {
        ...paymentInfo,
        amount: Number(paymentInfo?.amount) || 0,
      };
    } else {
      paymentModeMap[modeKey].amount += Number(paymentInfo?.amount) || 0;
    }
  });

  const mergedPaymentInfos = Object.values(paymentModeMap);

  if (mergedPaymentInfos.length === 0) {
    return null;
  }

  return (
    <div className={styles["payment-wrapper"]}>
      <div className={styles.mode}>{t("resource.common.payment_mode")}</div>
      {mergedPaymentInfos.map((paymentInfo, idx) => (
        <div
          key={`${paymentInfo?.display_name || paymentInfo?.mode}-${idx}`}
          className={styles["mode-data"]}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <img
              src={
                paymentInfo?.logo ||
                "https://cdn.iconscout.com/icon/premium/png-512-thumb/debit-card-10-742447.png?f=webp&w=256"
              }
              alt={paymentInfo?.mode}
            />
            <span
              className={styles["mode-name"]}
              style={{ marginLeft: 12, marginTop: 6 }}
            >
              {translateDynamicLabel(
                paymentInfo?.display_name || paymentInfo?.mode || "",
                t
              ) || t("resource.order.cod")}
            </span>
          </span>
          <span className={styles["mode-amount"]}>
            {paymentInfo?.amount !== undefined && paymentInfo?.amount !== null
              ? priceFormatCurrencySymbol(
                  paymentInfo?.currency_symbol ||
                    orderData?.breakup_values?.[0]?.currency_symbol,
                  paymentInfo?.amount,
                  formatLocale(locale, countryCode, true)
                )
              : null}
          </span>
        </div>
      ))}
    </div>
  );
}

// Delivery Address Component
function DeliveryAddress({ orderData, isLoggedIn, t }) {
  if (!isLoggedIn) {
    return null;
  }

  const getFullAddress = (addr) => {
    if (addr) {
      return getAddressStr(addr, false);
    }
  };

  const getAddressData = orderData?.shipments?.[0]?.delivery_address || {
    name: t("resource.order.john_doe"),
    address_type: "Home",
    phone: "1234567890",
  };

  return (
    <div className={styles["delivery-wrapper"]}>
      <div className={styles["delivery-header"]}>
        {t("resource.order.delivery_address")}
      </div>
      <div className={styles["delivery-details"]}>
        <div className={styles["name-label"]}>
          <div className={styles.name}>{getAddressData?.name}</div>
          <div className={styles.label}>
            {translateDynamicLabel(
              getAddressData?.address_type &&
                typeof getAddressData.address_type === "string"
                ? getAddressData.address_type.charAt(0).toUpperCase() +
                    getAddressData.address_type.slice(1)
                : getAddressData?.address_type || "",
              t
            )}
          </div>
        </div>
        <div className={styles["address-phone"]}>
          <div className={styles.address}>{getFullAddress(getAddressData)}</div>
          <div className={styles.phone}>{getAddressData?.phone}</div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function Component({
  fpi,
  globalConfig,
  blocks = [],
  customProps = {},
}) {
  const { t } = useGlobalTranslation("translation");
  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale;

  const { orderData, isLoggedIn } = customProps;

  if (!orderData?.order_id) {
    return null;
  }

  // Check if both payment_info and delivery_address blocks exist to wrap them together
  const hasPaymentInfo = blocks.some((b) => b.type === "payment_info");
  const hasDeliveryAddress = blocks.some((b) => b.type === "delivery_address");
  const shouldWrapPaymentAndAddress =
    hasPaymentInfo && hasDeliveryAddress && isLoggedIn;

  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}_${index}`;

        switch (block.type) {
          case "order_header":
            return (
              <OrderHeader
                key={key}
                orderData={orderData}
                isLoggedIn={isLoggedIn}
                locale={locale}
                countryCode={countryCode}
                t={t}
              />
            );

          case "shipment_list":
            return (
              <ShipmentList
                key={key}
                orderData={orderData}
                isLoggedIn={isLoggedIn}
                locale={locale}
                countryCode={countryCode}
                getGroupedShipmentBags={getGroupedShipmentBags}
                globalConfig={globalConfig}
                t={t}
              />
            );

          case "price_breakup":
            return <OrderPriceBreakup key={key} orderData={orderData} t={t} />;

          case "payment_info":
            // If both payment_info and delivery_address exist, wrap them together
            if (shouldWrapPaymentAndAddress) {
              const deliveryBlock = blocks.find(
                (b) => b.type === "delivery_address"
              );
              const deliveryIndex = blocks.indexOf(deliveryBlock);
              // Only render the wrapper on the first block (payment_info)
              if (index < deliveryIndex) {
                return (
                  <div
                    key="payment-address-wrapper"
                    className={`${styles["payment-address"]} fontBody`}
                  >
                    <PaymentInfo
                      orderData={orderData}
                      isLoggedIn={isLoggedIn}
                      locale={locale}
                      countryCode={countryCode}
                      t={t}
                    />
                    <DeliveryAddress
                      orderData={orderData}
                      isLoggedIn={isLoggedIn}
                      t={t}
                    />
                  </div>
                );
              }
              // Skip delivery_address as it's already rendered above
              return null;
            }
            // Render standalone with proper wrapper
            return (
              <div key={key} className="fontBody" style={{ marginTop: "16px" }}>
                <PaymentInfo
                  orderData={orderData}
                  isLoggedIn={isLoggedIn}
                  locale={locale}
                  countryCode={countryCode}
                  t={t}
                />
              </div>
            );

          case "delivery_address":
            // If wrapped with payment_info, skip rendering here
            if (shouldWrapPaymentAndAddress) {
              return null;
            }
            // Render standalone with proper wrapper
            return (
              <div key={key} className="fontBody" style={{ marginTop: "16px" }}>
                <DeliveryAddress
                  orderData={orderData}
                  isLoggedIn={isLoggedIn}
                  t={t}
                />
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}

export const settings = {
  label: "t:resource.sections.order_status.order_status",
  props: [],
  blocks: [
    {
      type: "order_header",
      name: "t:resource.sections.order_status.order_header",
      props: [],
    },
    {
      type: "shipment_list",
      name: "t:resource.sections.order_status.shipment_list",
      props: [],
    },
    {
      type: "price_breakup",
      name: "t:resource.sections.order_status.price_breakup",
      props: [],
    },
    {
      type: "payment_info",
      name: "t:resource.sections.order_status.payment_information",
      props: [],
    },
    {
      type: "delivery_address",
      name: "t:resource.sections.order_status.delivery_address",
      props: [],
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.sections.order_status.order_header",
      },
      {
        name: "t:resource.sections.order_status.shipment_list",
      },
      {
        name: "t:resource.sections.order_status.price_breakup",
      },
      {
        name: "t:resource.sections.order_status.payment_information",
      },
      {
        name: "t:resource.sections.order_status.delivery_address",
      },
    ],
  },
};

export default Component;
